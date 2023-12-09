import Vue from 'vue'
import VueRouter, {RouteConfig} from 'vue-router'
import SprintPlanning from '@/views/SprintPlanning.vue'
import Home from '@/views/Home.vue'

Vue.use(VueRouter)

const routes: Array<RouteConfig> = [
    // {
    //     path: '',
    //     component: () => import('@/components/layout/Full.vue'),
    //     children: [
    //         {
    //             path: '/',
    //             name: 'Home',
    //             component: Home
    //         }
    //     ]
    // },
    {
        path: '',
        component: () => import('@/components/layout/Default.vue'),
        children: [
            {
                path: '/',
                name: 'Home',
                component: Home
            },
            {
                path: '/sprintPlanning/:id',
                name: 'SprintPlanning',
                component: SprintPlanning
            }
        ]
    },
    {
        path: '*',
        name: '404',
        redirect: {name: 'Home'}
    }
]

const router = new VueRouter({
    mode: 'history',
    base: process.env.BASE_URL,
    routes
});

export default router;
