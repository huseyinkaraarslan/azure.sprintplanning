/* eslint-disable @typescript-eslint/no-var-requires */
let io = require('socket.io');
const createError = require('http-errors');
const scoringScreenStatus = require('./enums/scoringScreenStatus');

const cors = {
    // origin: process.env.SITE_URL,
    // methods: ['GET', 'POST'],
    // allowedHeaders: ['authorization'],
    // credentials: true
};

const plannings = {};

const generatePlanningId = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);

        return v.toString(16);
    });
}

const addUserToPlanning = (socket) => {
    socket.join(socket.user.planningId);
    const scores = [];
    scores.length = socket.user.scoresLength;
    scores.fill('');
    const user = {
        name: socket.user.name,
        socketId: socket.user.socketId,
        scores: scores
    };
    if (socket.isNewPlanning) {
        delete socket.isNewPlanning;
        plannings[socket.user.planningId] = {
            users: [user],
            scoringScreenStatus: scoringScreenStatus.READY,
            workItemIndex: '-1',
            adminName: user.name,
            showScores: false,
            workItems: []
        };
        socket.emit('new_planning_created', {...plannings[socket.user.planningId], planningId: socket.user.planningId});
    } else {
        plannings[socket.user.planningId].users.push(user);
        socket.emit('init', plannings[socket.user.planningId]);
        socket.to(socket.user.planningId).emit('user_joined', user);
    }
}

const removeUserFromPlanning = (socket) => {
    if (plannings[socket.user.planningId]) {
        const index = plannings[socket.user.planningId].users.map(user => user.socketId).indexOf(socket.user.socketId);
        if (index > -1) {
            plannings[socket.user.planningId].users.splice(index, 1);
            if (plannings[socket.user.planningId].users.length === 0) {
                delete plannings[socket.user.planningId];
            } else {
                if (socket.user.isAdmin) {
                    plannings[socket.user.planningId].users.forEach(user => {
                        const scores = [];
                        scores.length = socket.user.scoresLength;
                        scores.fill('');
                        user.scores = scores;
                    });
                    plannings[socket.user.planningId].scoringScreenStatus = scoringScreenStatus.READY;
                    plannings[socket.user.planningId].workItemIndex = -1;
                }
                socket.to(socket.user.planningId).emit('user_left', {...plannings[socket.user.planningId], leftUserName: socket.user.name});
            }
        }
    }
}

exports.socket = (server) => {
    io = io(server, {cors: cors, maxHttpBufferSize: 1e8});
    io.sockets.use((socket, next) => {
        try {
            const userName = socket.handshake.query.userName;
            if (!userName || userName === 'undefined') {
                return next(createError(401, {message: 'User_Name_Is_Required'}));
            }
            let isAdmin = false;
            let planningId = '';
            if (socket.handshake.query.isNew === '1') {
                isAdmin = true;
                planningId = generatePlanningId();
                socket.isNewPlanning = true;
            } else {
                planningId = socket.handshake.query.planningId;
                if (!planningId) {
                    return next(createError(500, {message: 'Planning_Not_Found'}));
                }
                if (!plannings[planningId]) {
                    if (socket.handshake.query.isAdmin === 'true' && planningId.length === 36) {
                        // Admin can use same url in next plannings.
                        isAdmin = true;
                        socket.isNewPlanning = true;
                    } else {
                        return next(createError(500, {message: 'Planning_Not_Found'}));
                    }
                } else {
                    if (plannings[planningId]) {
                        const sameUser = plannings[planningId].users.find(u => u.name === userName);
                        if (sameUser) {
                            return next(createError(500, {message: 'Same_User_Message'}));
                        }
                    }
                    if (socket.handshake.query.isAdmin === 'true') {
                        if (plannings[planningId].adminName !== userName) {
                            return next(createError(401, {message: 'Access_Denied'}));
                        }
                        isAdmin = true;
                    }
                }
            }
            const prevPlanningId = socket.handshake.query.prevPlanningId;
            if (prevPlanningId && plannings[prevPlanningId]) {
                const user = plannings[prevPlanningId].users.find(u => u.name === userName);
                if (user) {
                    const prevUserSocket = io.sockets.sockets.get(user.socketId);
                    if (prevUserSocket.user.isAdmin) {
                        io.in(prevPlanningId).emit('Planning_Stopped_Because_Your_Admin_Is_Joining_Another_Planning');
                        io.in(prevPlanningId).disconnectSockets();
                        delete plannings[prevPlanningId];
                    } else {
                        const s = io.sockets.sockets.get(user.socketId);
                        if (s && s.id === user.socketId) {
                            s.emit('You_Were_Disconnected_Because_You_Joined_Another_Planning');
                            s.disconnect();
                            removeUserFromPlanning(s);
                        }
                    }
                }
            }
            socket.user = {
                name: userName,
                isAdmin: isAdmin,
                planningId: planningId,
                socketId: socket.id,
                scoresLength: socket.handshake.query.scoresLength
            };
            next();
        } catch (e) {
            return next(createError(500, {message: 'An_Error_Occurred'}));
        }
    }).on('connection', async (socket) => {
        addUserToPlanning(socket);

        socket.on('update_work_items', (workItems) => {
            plannings[socket.user.planningId].workItemIndex = -1;
            plannings[socket.user.planningId].workItems = workItems;
            socket.to(socket.user.planningId).emit('update_work_items', workItems);
        });

        socket.on('update_user_scores', (userScores) => {
            const user = plannings[socket.user.planningId].users.find(u => u.name === socket.user.name);
            if (user) {
                user.scores = userScores;
                socket.to(socket.user.planningId).emit('update_user_scores', user);
            }
        });

        socket.on('show_scores', (val) => {
            const planning = plannings[socket.user.planningId];
            planning.showScores = val;
            socket.to(socket.user.planningId).emit('show_scores', val);
        });

        socket.on('update_screen_status', (data) => {
            const planning = plannings[socket.user.planningId];
            let scoringScreenStatus = data.scoringScreenStatus;
            if (data.scoringScreenStatus === scoringScreenStatus.RESUME) {
                scoringScreenStatus = scoringScreenStatus.PLAY;
            }
            planning.scoringScreenStatus = scoringScreenStatus;
            planning.workItemIndex = data.workItemIndex;
            socket.to(socket.user.planningId).emit('update_screen_status', {scoringScreenStatus: data.scoringScreenStatus, workItemIndex: planning.workItemIndex});
        });

        socket.on('open_work_item', () => {
            socket.to(socket.user.planningId).emit('open_work_item');
        });

        socket.on('close_work_item', () => {
            socket.to(socket.user.planningId).emit('close_work_item');
        });

        socket.on('update_work_item', (workItem) => {
            socket.to(socket.user.planningId).emit('update_work_item', workItem);
        });

        socket.on('update_temp_work_item', (tempSelectedWorkItem) => {
            socket.to(socket.user.planningId).emit('update_temp_work_item', tempSelectedWorkItem);
        });

        socket.on('open_sprint', () => {
            socket.to(socket.user.planningId).emit('open_sprint');
        });

        socket.on('close_sprint', () => {
            socket.to(socket.user.planningId).emit('close_sprint');
        });

        socket.on('update_sprint_work_items', (workItems) => {
            socket.to(socket.user.planningId).emit('update_sprint_work_items', workItems);
        });

        socket.on('disconnecting', () => {
            removeUserFromPlanning(socket);
        });
    });
};
