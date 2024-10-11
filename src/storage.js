import { events } from "./eventHandler";

export let projects = {};
export let tasks = {};

export function initStorage(){
  if(!localStorage.getItem("projects")){
    updateStorage();
  }
  else{
    loadStorage();
  }
  events.trigger("initialize-projects", projects);
};

function loadStorage(){
  projects = JSON.parse(localStorage.getItem("projects"));
  tasks = JSON.parse(localStorage.getItem("tasks"));
};

function updateStorage(){
  localStorage.setItem("projects", JSON.stringify(projects));
  localStorage.setItem("tasks", JSON.stringify(tasks));
};

function addNewProject(project){
  projects[project['project-ID']] = project;
  updateStorage();
};

function addNewTask(task){
  tasks[task['task-ID']] = task;
  projects[task['project-ID']]['project-tasks'].push(task['task-ID']);
  updateStorage();
}

function removeProject(projectID){
  const projectTasks = projects[projectID]['project-tasks'];
  while(projectTasks.length != 0){
    events.trigger("remove-task", projectTasks[0]);
  }
  delete projects[projectID]
  updateStorage();
}

function removeTask(taskID){
  const projectID = tasks[taskID]['project-ID'];
  const removeIndex = projects[projectID]['project-tasks'].indexOf(taskID);
  if(removeIndex > -1){
    projects[projectID]['project-tasks'].splice(removeIndex,1);
  }
  delete tasks[taskID];
  updateStorage();
}

function updateProjectName([projectID, newName]){
  projects[projectID]['project-name'] = newName;
  updateStorage();
}

function updateTask(task){
  tasks[task['task-ID']] = task;
  updateStorage();
}

function updatedTaskCheckbox([taskID, isCompleted]){
  tasks[taskID]['completed'] = isCompleted;
  updateStorage(); 
}

events.on("add-project", addNewProject);
events.on("add-task", addNewTask);
events.on("remove-project", removeProject);
events.on("update-project-name", updateProjectName);
events.on("remove-task", removeTask);
events.on("update-task", updateTask);
events.on("update-task-checkbox", updatedTaskCheckbox);

