# azure.sprintplanning
This application; 
It allows you to score your current sprints in Azure Devops with your teammates and create tasks.

Usage:
- Your teammate who will manage the planning opens the application.
- After entering the username, it exports the sprint in .csv format from the backlog section of the current sprint in Azure Devops.
- It imports the sprint backlog in .csv format to the application via the import Csv button in the application.
- clicks the start button and a planning is created.
- Copies this URL and forwards it to the teammates who will participate in the planning.
- Sprint user stories (workItems) are listed on the right side of the application.
- The administrator starts a workItem of his choice from the list by clicking on the button with the play icon. Everyone is expected to score.
- There are 4 different categories in scoring. (Complexity, Uncertainty, Time and Risk). Sample values can be viewed from the PT (Point Table) shown below.
- When all users have finished scoring, the administrator stops the scoring by pressing the gavel button at the bottom and determines and saves the final work item and related tasks.
- The administrator repeats these operations for other items.
- You can set the scoring as open or hidden via the button with the eye icon at the bottom.
- After the items are completed, the sprint screen opens by pressing the rightmost button below.
- Here, he will now be able to make a general observation by selecting the items he wants and will be able to export the selected items in .csv format.
- By importing this exported file again from the same place in Azure Devops, all items and tasks will be transferred to the Azure environment.
- While the administrator is performing these operations, other participants will be able to see all the actions taken by the administrator on their own screen.

(https://azuresprintplanning2-ong7u8b6.b4a.run/)
   
## Project setup
Install project dependencies with
```
yarn install
```
Then open 2 different terminals and run the following commands
```
yarn start
```
```
yarn serve
```