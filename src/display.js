import appLogo from "./assets/MyTasks_logo.svg";
import todayProjectIcon from "./assets/today_project_icon.svg";
import weekProjectIcon from "./assets/week_project_icon.svg";
import allProjectIcon from "./assets/all_project_icon.svg";
import addProjectIcon from "./assets/add_project_icon.svg";
import projectIcon from "./assets/project_icon.svg";
import darkModeIcon from "./assets/dark_mode_icon.svg";
import tickIcon from "./assets/tick_icon.svg";
import leftArrowIcon from "./assets/left_arrow_icon.svg";
import deleteIcon from "./assets/delete_icon.svg";
import pencilIcon from "./assets/pencil_icon.svg";
import flagIcon from "./assets/flag_icon.svg";
import sortIcon from "./assets/sort_icon.svg";

import { events } from "./eventHandler";
import { projects , tasks } from "./storage";
const { nanoid } = require("nanoid");
const { compareAsc , isFuture , formatDistanceToNow , differenceInCalendarDays } = require("date-fns");


const headerContainer = document.querySelector('#header-container');
const navContainer = document.querySelector('#nav-container');
const mainContainer = document.querySelector('#main-container');
const sideContainer = document.querySelector('#side-container');

let selectedNavElement = undefined;
let sortPreference = "date";
let selectedTaskID = undefined;

function createSVGTextContainer(SVG_path, text, IDTag=undefined){
    const container = document.createElement("div");
    const iconContainer = document.createElement("div");
    const textContainer = document.createElement("div");
    fetch(SVG_path)
        .then(response => response.text())
        .then(svg => {
            iconContainer.innerHTML = svg;
        })
        .catch(error => console.error('Error loading the SVG: ', error));
    iconContainer.classList.add('icon-container');
    textContainer.textContent = text;
    textContainer.classList.add('text-container');
    container.appendChild(iconContainer);
    container.appendChild(textContainer);
    container.classList.add('icon-text-container');
    if(IDTag != undefined){
        container.id = IDTag;
    }
    return container;
}

function createSVGContainer(SVG_path){
    const iconContainer = document.createElement("div");
    iconContainer.classList.add("icon-container");
    fetch(SVG_path)
    .then(response => response.text())
    .then(svg => {
        iconContainer.innerHTML = svg;
    })
    .catch(error => console.error('Error loading the SVG: ', error));
    return iconContainer;
}

function createSVGButton(SVG_path, IDTag=undefined, text=undefined){
    const container = document.createElement("button");
    const iconContainer = document.createElement("div");
    fetch(SVG_path)
    .then(response => response.text())
    .then(svg => {
        iconContainer.innerHTML = svg;
    })
    .catch(error => console.error('Error loading the SVG: ', error));
    iconContainer.classList.add('icon-container');
    container.appendChild(iconContainer);
    if(text != undefined){
        const textContainer = document.createElement("div");
        textContainer.textContent = text;
        textContainer.classList.add('text-container');
        container.appendChild(textContainer)
    }
    if(IDTag != undefined){
        container.id = IDTag;
    }
    return container;
}

function initHeader(){
    headerContainer.innerHTML = '';
    const logoContainer = createSVGTextContainer(appLogo, "MyTasks");
    logoContainer.onclick = ()=>{window.location.reload()};
    headerContainer.appendChild(logoContainer);
    const darkModeButton = createSVGButton(darkModeIcon, "dark-mode-button");
    darkModeButton.onclick = toggleDarkMode;
    headerContainer.appendChild(darkModeButton);
    headerContainer.classList.add("flex-apart");
}

function initNav(){
    navContainer.innerHTML = '';
    const navSectionFilter = document.createElement("div");
    const navSectionProjects = document.createElement("div");
    const navSectionCompleted = document.createElement("div");
    
    navSectionFilter.classList.add("nav-section");
    navSectionCompleted.classList.add("nav-section");
    navSectionFilter.id = "nav-section-filter";
    navSectionProjects.id = "nav-section-projects";

    const todayTaskContainer = createSVGTextContainer(todayProjectIcon, "Today", "today-project");
    const weekTaskContainer = createSVGTextContainer(weekProjectIcon, "Next 7 Days", "today-project");
    const allTaskContainer = createSVGTextContainer(allProjectIcon, "All Tasks", "today-project");

    todayTaskContainer.addEventListener("click", ()=>{
        selectNavElement(todayTaskContainer);
        displayTasksOnMainScreen("Today");
    });

    weekTaskContainer.addEventListener("click", ()=>{
        selectNavElement(weekTaskContainer);
        displayTasksOnMainScreen("Next 7 Days");
    });

    allTaskContainer.addEventListener("click", ()=>{
        selectNavElement(allTaskContainer);
        displayTasksOnMainScreen("All Tasks");
    });

    navSectionFilter.appendChild(todayTaskContainer);
    navSectionFilter.appendChild(weekTaskContainer);
    navSectionFilter.appendChild(allTaskContainer);
    
    const addProjectContainer = document.createElement("div");
    const addProjectContainerText = document.createElement("div");
    addProjectContainer.id = "add-project-container";
    addProjectContainerText.textContent = "Projects:";
    addProjectContainer.appendChild(addProjectContainerText);
    addProjectContainer.appendChild(createSVGButton(addProjectIcon, "add-project-button"));
    navSectionProjects.appendChild(addProjectContainer);

    const projectListContainer = document.createElement("div");
    projectListContainer.id = "project-list-container";
    projectListContainer.classList.add("nav-section");
    navSectionProjects.appendChild(projectListContainer);

    const completedTaskContainer = createSVGTextContainer(tickIcon,"Completed","completed-project");
    completedTaskContainer.addEventListener("click", ()=>{
        selectNavElement(completedTaskContainer);
        displayTasksOnMainScreen("Completed");
    });
    navSectionCompleted.appendChild(completedTaskContainer);
    

    navContainer.appendChild(navSectionFilter);
    navContainer.appendChild(navSectionProjects);
    navContainer.appendChild(navSectionCompleted);
}

function createFormInput(type, NameTag=undefined, placeholder="", required=false){
    const inputElement = document.createElement("input");
    inputElement.setAttribute("type", type);
    if(NameTag != undefined){
        inputElement.setAttribute("id", NameTag);
        inputElement.setAttribute("name", NameTag);
    }
    inputElement.setAttribute("placeholder", placeholder);
    if(required){
        inputElement.setAttribute("required","");
    }
    return inputElement;
}

function createFormLabel(labelText, ForTag){
    const labelElement = document.createElement("label");
    labelElement.textContent = labelText;
    labelElement.setAttribute("for", ForTag);
    return labelElement;
}

function createFormButton(type, buttonText){
    const buttonElement = document.createElement("button");
    buttonElement.setAttribute("type", type);
    buttonElement.textContent = buttonText;
    return buttonElement;
}

function createDivFromElements(listOfElements, className=undefined, IDTag=undefined){
    const divContainer = document.createElement("div");
    if(className != undefined){
        divContainer.classList.add(className);
    }
    if(IDTag != undefined){
        divContainer.id = IDTag;
    }
    for (const element of listOfElements){
        divContainer.appendChild(element);
    }
    return divContainer;
}

function initDialog(){
    const addNewProjectDialog = document.createElement("dialog");
    addNewProjectDialog.id = "new-project-dialog";
    const newProjectForm = document.createElement("form");
    newProjectForm.appendChild(createDivFromElements([createFormLabel("New Project:", "project-name"),createFormInput("text", "project-name", "Project Name", true)],"form-segment"));
    const closeButton = createFormButton("reset", "Cancel");
    closeButton.onclick = ()=> {addNewProjectDialog.close()};
    
    newProjectForm.addEventListener("submit",(e)=>{
        e.preventDefault();
        const project = Object.fromEntries(new FormData(e.target));
        project['project-ID'] = nanoid();
        project['project-tasks'] = [];
        events.trigger('add-project',project);
        
        e.target.reset();
        addNewProjectDialog.close();
    });

    newProjectForm.appendChild(closeButton);
    newProjectForm.appendChild(createFormButton("submit","Add"));
    addNewProjectDialog.appendChild(newProjectForm);
    navContainer.appendChild(addNewProjectDialog);
    const addNewProjectButton = document.querySelector("#add-project-button");
    addNewProjectButton.onclick = () => {addNewProjectDialog.showModal();};
}

function initProjects(projects){
    const projectListContainer = document.querySelector("#project-list-container");
    projectListContainer.innerHTML = '';
    for (const projectID in projects){
        addProject(projects[projectID]);
    }
    if(JSON.stringify(projects) === '{}'){
        const textContainer = document.createElement("h1");
        textContainer.textContent = "Let's get some work done! Start by adding a New Project :)";
        mainContainer.innerHTML = '';
        mainContainer.appendChild(textContainer);
    }
}

function addProject(project){
    const projectListContainer = document.querySelector("#project-list-container");
    const projectContainer = createSVGTextContainer(projectIcon, project['project-name'], project['project-ID']);
    projectContainer.classList.add('project-container');
    projectListContainer.appendChild(projectContainer);
    projectContainer.addEventListener("click", ()=>{
        selectNavElement(projectContainer);
        displayProjectOnMainScreen(projectContainer.id);
    });
    projectContainer.click();
}

function removeProject(projectID){
    navContainer.classList.remove("hide");
    mainContainer.innerHTML = "";
    document.getElementById(projectID).remove();
}

function selectNavElement(element){
    if(selectedNavElement != undefined){
        selectedNavElement.classList.remove("selected");
    }
    selectedNavElement = element;
    selectedNavElement.classList.add("selected");
}

function refreshMainDisplay(){
    if(selectNavElement != undefined){
        selectedNavElement.click();
    }
}

function createTextArea(initialText, rows, cols, classList=[], IDTag=undefined){
    const textArea = document.createElement("textarea");
    textArea.textContent = initialText;
    textArea.setAttribute("rows", rows);
    textArea.setAttribute("cols", cols);
    for (const classItem of classList){
        textArea.classList.add(classItem);
    }
    if(IDTag != undefined){
        textArea.id = IDTag;
    }
    return textArea;
}

function updateProjectName([projectID, newName]){
    const projectContainer = document.querySelector(`#${projectID}`);
    const projectTextContainer = projectContainer.querySelector(".text-container");
    projectTextContainer.textContent = newName;
}

function createDropdownForm(classList=[], IDTag=undefined){
    const dropDownForm = document.createElement("form");
    dropDownForm.classList.add("dropdown-container");
    dropDownForm.classList.add("hide");
    for (const classItem of classList){
        dropDownForm.classList.add(classItem);
    }
    if(IDTag != undefined){
        dropDownForm.id = IDTag;
    }
    return dropDownForm;
}

function displayTasksOnMainScreen(filter){
    mainContainer.innerHTML = "";

    const mainContainerHeader = document.createElement("div");
    mainContainerHeader.classList.add("flex-apart");
    mainContainerHeader.id = "main-container-header";
    const titleContainer = document.createElement("div");
    titleContainer.textContent = filter;
    mainContainerHeader.appendChild(createDivFromElements([createHideNavButton(), titleContainer], "flex-apart"));
    mainContainerHeader.appendChild(createDivFromElements([createSortSelectionButton()], "flex-apart"));
    mainContainer.appendChild(mainContainerHeader);

    let tasksOrder = Object.values(tasks);

    if(filter === "Today"){
        tasksOrder = tasksOrder.filter((task)=>differenceInCalendarDays(task['due-date'], new Date())<1);
    }

    if(filter === "Next 7 Days"){
        tasksOrder = tasksOrder.filter((task)=>differenceInCalendarDays(task['due-date'], new Date())<7);
    }

    if(filter === "Completed"){
        tasksOrder = tasksOrder.filter((task)=>task['completed']===true);
    }
    else{
        tasksOrder = tasksOrder.filter((task)=>task['completed']===false);
    }

    tasksOrder = sortTaskOrder(tasksOrder, sortPreference);

    for (const task of tasksOrder){
        mainContainer.appendChild(createTaskContainer(task['task-ID']));
    }
}

function createSortSelectionButton(){
    const sortSelectionContainer = document.createElement("div");
    sortSelectionContainer.style.position = "relative";
    const sortSelectionButton = createSVGButton(sortIcon,"sort-selection-button");
    const sortSelectionForm = createDropdownForm(["form-segment"]);
    sortSelectionForm.appendChild(createFormLabel("Sort by:","sort-preference"));
    sortSelectionForm.appendChild(createFormSelection("sort-preference",[["date","Due date"],["priority","Priority"]], sortPreference));
    sortSelectionForm.addEventListener("change", (e)=>{
        if(e.target.value !== sortPreference){
            sortPreference = e.target.value;
            refreshMainDisplay();
        }
    })
    sortSelectionButton.onclick = (e)=>{
        sortSelectionForm.classList.toggle("hide");
    };
    sortSelectionContainer.appendChild(sortSelectionButton);
    sortSelectionContainer.appendChild(sortSelectionForm);
    return sortSelectionContainer;
}

function displayProjectOnMainScreen(projectID){
    mainContainer.innerHTML = "";

    const project = projects[projectID];
    const projectName = createTextArea(project['project-name'], 1, 30, ["textarea-display-type"]);
    projectName.addEventListener("keypress",(e)=>{
        if(e.key === "Enter"){
            e.preventDefault();
            if(projectName.value != ""){
                events.trigger("update-project-name", [projectID, projectName.value]);
                projectName.blur();
            }
            else{
                alert("It would be hard to organize a project with no name :(");
            }
        }
    });
    const deleteProjectButton = createSVGButton(deleteIcon, "delete-project-button");
    deleteProjectButton.setAttribute("project-ID", project['project-ID']);
    deleteProjectButton.onclick = ()=>{
        if(confirm(`Are you sure you want to delete project "${project['project-name']}"?`)){
            events.trigger("remove-project", deleteProjectButton.getAttribute("project-ID"));
        }
    };

    const mainContainerHeader = document.createElement("div");
    mainContainerHeader.classList.add("flex-apart");
    mainContainerHeader.id = "main-container-header";
    mainContainerHeader.appendChild(createDivFromElements([createHideNavButton(), projectName], "flex-apart"));
    mainContainerHeader.appendChild(createDivFromElements([createSortSelectionButton(), deleteProjectButton], "flex-apart"));
    mainContainer.appendChild(mainContainerHeader);

    const addTaskForm = document.createElement("form");
    addTaskForm.id = "add-task-form";
    addTaskForm.classList.add("flex-apart");
    addTaskForm.setAttribute("project-ID", projectID);
    addTaskForm.appendChild(createFormInput("text", "task-name", "+ Task", true));
    addTaskForm.addEventListener("submit", (e)=>{
        e.preventDefault();
        const task = Object.fromEntries(new FormData(e.target));
        task["task-ID"] = nanoid();
        task["project-ID"] = addTaskForm.getAttribute("project-ID");
        task["due-date"] = undefined;
        task["priority"] = 0;
        task["completed"] = false;
        task["description"] = "";
        events.trigger("add-task", task);
        e.target.reset();
    });
    mainContainer.appendChild(addTaskForm);

    const taskList = projects[projectID]['project-tasks'];
    let tasksOrder = taskList.map((taskID)=>tasks[taskID]);
    
    tasksOrder = tasksOrder.filter((task)=>task['completed']===false);

    tasksOrder = sortTaskOrder(tasksOrder, sortPreference);

    for (const task of tasksOrder){
        mainContainer.appendChild(createTaskContainer(task['task-ID']));
    }
}

function sortTaskOrder(tasksOrder, sortType){

    if(sortType == "date"){
        let dateLessTasks = tasksOrder.filter((task)=>task['due-date']==undefined);
        let datedTasks = tasksOrder.filter((task)=>task['due-date']!=undefined);
        datedTasks.sort((taskA, taskB)=>compareAsc(taskA['due-date'], taskB['due-date']));
        tasksOrder = datedTasks.concat(dateLessTasks);
    }
    else if(sortType == "priority"){
        tasksOrder.sort((taskA, taskB)=>taskB['priority']-taskA['priority']);
    }

    return tasksOrder;

}

function createTaskContainer(taskID){
    const taskContainer = document.createElement("form");
    taskContainer.classList.add("task-container");
    if(taskID === selectedTaskID){
        taskContainer.classList.add("selected");
    }
    taskContainer.id = taskID;
    const taskNameContainer = document.createElement("div");
    taskNameContainer.classList.add("task-name-container");
    taskNameContainer.addEventListener("click", ()=>{
        selectTaskContainer(taskID);
    });
    const text = document.createElement("div");
    text.textContent = tasks[taskID]['task-name'];
    taskNameContainer.appendChild(text);
    const taskCheckbox = createFormInput("checkbox","completed");
    taskCheckbox.checked = tasks[taskID]['completed'];
    taskCheckbox.addEventListener("change", (e)=>{
        events.trigger("update-task-checkbox", [taskID, taskCheckbox.checked]);
    });
    taskContainer.appendChild(taskCheckbox);
    taskContainer.appendChild(taskNameContainer);
    if(tasks[taskID]['due-date'] != undefined){
        const dueDate = tasks[taskID]['due-date'];
        const dueDateInfo = document.createElement("div");
        dueDateInfo.classList.add("due-date-info");
        if(isFuture(dueDate)){
            dueDateInfo.classList.add("color-blue");
        }else{
            dueDateInfo.classList.add("color-red");
        }
        dueDateInfo.textContent = "Due " + formatDistanceToNow(dueDate, {addSuffix: true});
        taskContainer.appendChild(dueDateInfo);
    };
    if(tasks[taskID]['priority'] > 0){
        const flagContainer = createSVGTextContainer(flagIcon);
        switch(tasks[taskID]['priority']){
            case "1":
                flagContainer.classList.add("color-blue");
                break;
            case "2":
                flagContainer.classList.add("color-yellow");
                break;
            case "3":
                flagContainer.classList.add("color-red");
                break;
            default:
        }
        taskContainer.appendChild(flagContainer);
    };
    return taskContainer;
}

function addTask(task){
    refreshMainDisplay();
    selectTaskContainer(task['task-ID']);
}

function updateTaskCheckbox([taskID, isCompleted]){
    refreshMainDisplay();
}

function createFormSelection(name, valueOptionList, optionalSelectedItem=undefined , classList=[], IDTag=undefined){
    const selectElement = document.createElement("select");
    selectElement.setAttribute("name", name);
    for (const valueOptionPair of valueOptionList){
        const valueOptionElement = document.createElement("option");
        valueOptionElement.setAttribute("value", valueOptionPair[0]);
        valueOptionElement.textContent = valueOptionPair[1];
        selectElement.appendChild(valueOptionElement);
    }
    if(optionalSelectedItem != undefined){
        selectElement.value = optionalSelectedItem;
    }
    for (const classItem of classList){
        selectElement.classList.add(classItem);
    }
    if(IDTag != undefined){
        selectElement.id = IDTag;
    }
    return selectElement;
}

function selectTaskContainer(taskID){
    let selectedElement = document.getElementById(selectedTaskID);
    if(selectedElement != null){
        selectedElement.classList.remove("selected");    
    }
    selectedTaskID = taskID;
    selectedElement = document.getElementById(selectedTaskID);
    selectedElement.classList.add("selected");
    displayTask(taskID);
}

const convertToDateTimeLocalString = (date) => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
  
    return `${year}-${month}-${day}T${hours}:${minutes}`;
}

function displayTask(taskID){
    sideContainer.innerHTML = "";

    const task = tasks[taskID];
    const taskForm = document.createElement("form");
    taskForm.classList.add("task-form");
    taskForm.setAttribute("task-ID", taskID);
    
    const taskName = createTextArea(task['task-name'], 2, 20, ["textarea-display-type", "larger-font", "task-name"]);
    const projectName = document.createElement("div");
    projectName.textContent = `(${projects[task['project-ID']]['project-name']})`;
    const taskProjectNamePair = createDivFromElements([taskName, projectName]);

    const dueDateLabel = createFormLabel("Due Date:", "due-date");
    const dueDateInput = createFormInput("datetime-local", "due-date");
    if(task['due-date'] != undefined){
        dueDateInput.value = convertToDateTimeLocalString(new Date(task['due-date']));
    }
    const dueDateSegment = createDivFromElements([dueDateLabel, dueDateInput], "form-segment");
    const priorityLabel = createSVGTextContainer(flagIcon, "Priority:");
    const priorityInput = createFormSelection("priority", [[0,"None"],[3,"High"],[2,"Medium"],[1,"Low"]], task['priority']);
    const prioritySegment = createDivFromElements([priorityLabel, priorityInput], "form-segment");
    const deleteTaskButton = createSVGButton(deleteIcon, "delete-task-button");
    deleteTaskButton.setAttribute("type", "button");
    deleteTaskButton.addEventListener("click",()=>{
        if(confirm(`Are you sure you want to delete task "${task['task-name']}"?`)){
            events.trigger("remove-task", taskID);
        }
        refreshMainDisplay();
    });
    const priorityDeleteSegment = createDivFromElements([prioritySegment, deleteTaskButton], "flex-apart");
    const topRightSegment = createDivFromElements([dueDateSegment, priorityDeleteSegment], "task-form-top-right-segment");

    const descriptionText = createTextArea(task['description'], 10, 50, ["description-text"]);
    descriptionText.setAttribute("placeholder", "Description");

    taskForm.appendChild(taskProjectNamePair);
    taskForm.appendChild(topRightSegment);
    taskForm.appendChild(descriptionText);

    taskForm.addEventListener("change", ()=>{
        const updatedTask = {
            "task-ID" : taskID,
            "task-name" : taskName.value || task['task-name'],
            "project-ID" : task['project-ID'],
            "due-date" : dueDateInput.value || undefined,
            "priority" : priorityInput.value,
            "completed" : task['completed'],
            "description" : descriptionText.value,
        };
        events.trigger("update-task", updatedTask);
        refreshMainDisplay();
    })

    sideContainer.appendChild(taskForm);
}

function removeTask(taskID){
    if(selectedTaskID === taskID){
        sideContainer.innerHTML = "";
        selectedTaskID = undefined;
    }
}

function createHideNavButton(){
    const hideNavButton = createSVGButton(leftArrowIcon, "hide-nav-button");
    hideNavButton.onclick = ()=>{
        navContainer.classList.toggle("hide");
        hideNavButton.classList.toggle("rotate-180");
    };
    return hideNavButton;
}

function toggleDarkMode(){
    document.body.classList.toggle("dark-mode");
}

events.on("initialize-projects", initProjects);
events.on("add-project", addProject);
events.on("remove-project", removeProject);
events.on("add-task", addTask);
events.on("update-project-name", updateProjectName);
events.on("remove-task", removeTask);
events.on("update-task-checkbox", updateTaskCheckbox);

export function initDisplay(){
    initHeader();
    initNav();
    initDialog();
}

