'use strict';

/** 
 * Project Links
 * @typedef {Object} ProjectLinks
 * @property {string} github - link to code hosted on github
 * @property {string} info - link to more info about the project
 * @property {string} web - link to view the live website
 * 
 * Project (Constants.js)
 * @typedef {Object} Project
 * @property {string} title - title of the project
 * @property {string} description - description of the project
 * @property {ProjectLinks} links - An object containing links to various pages (github, info, web)
 * 
*/

let projectsColl = document.getElementsByClassName("project");
let projectsArr = Array.from(projectsColl);
let timelines = [];
let projectInfoTimeline;
let maxOrder = 6;

const mediaQuery = window.matchMedia('(max-width: 1000px)');
const hamburger = document.getElementById("hamburger");
let mobileTimelines = [];

let displayTitle, displayDescription, displayGithub, displayInfo, displayWeb;

//Must be called before buttons because it involves creating the nav
if(!mediaQuery.matches){
    //only execute if not a mobile device
    createNav(false);
    setHeightOfHobbyElement();
    window.addEventListener("resize", function(e){
        setHeightOfHobbyElement();
    })
}
else{
    createNav(true);
}

const body = document.querySelector("body");
const aboutBtn = document.getElementById("aboutBtn");
const servicesBtn = document.getElementById("servicesBtn");
const projectsBtn = document.getElementById("projectsBtn");
const contactBtn = document.getElementById("contactBtn");

const titleDiv = document.getElementById("projectTitle");
const titleSpan = document.getElementById("titleSpan");
const projectInfoWrapper = document.getElementById("projectInfoWrapper");
const descriptionP = document.getElementById("descriptionP");
const githubLink = document.getElementById("githubLink");
const infoLink = document.getElementById("infoLink");
const webLink = document.getElementById("webLink");

let titleDivRect = titleDiv.getBoundingClientRect();
const setHeightOfHobbyElementialProjWidth = roundToTwo(titleDivRect.width / body.getBoundingClientRect().width) * 100;

aboutBtn.addEventListener("click", function(e){
    scrollToElement("about");
    if (mediaQuery.matches){
        closeMobileNav();
    }
});

servicesBtn.addEventListener("click", function(e){
    scrollToElement("whatIDo");
    if (mediaQuery.matches){
        closeMobileNav();
    }
});

projectsBtn.addEventListener("click", function(e){
    scrollToElement("projects");
    if (mediaQuery.matches){
        closeMobileNav();
    }
});

contactBtn.addEventListener("click", function(e){
    scrollToElement("contact");
    if (mediaQuery.matches){
        closeMobileNav();
    }
});

projectsArr.forEach(element => {
    if (mediaQuery.matches){
        createProjectInfoMobile(element, element.dataset.id);
        element.addEventListener("click", onProjectClickMobile);
    }
    else{
        element.addEventListener("click", onProjectClick);
        createTimeline(element);
    }
});

titleDiv.addEventListener("click", function(e){
    closeOpenProject();
    titleSpan.textContent = "";
});
titleDiv.addEventListener("mouseenter", function(e){
    let openProject = document.getElementsByClassName("open")[0];
    if (openProject != null){
        titleSpan.textContent = "Close";
    }
});
titleDiv.addEventListener("mouseleave", function(e){
    if (displayTitle != null){
        titleSpan.textContent = displayTitle;
    }
    else{
        titleSpan.textContent = "";
    }
});

/**
 * Handles onClick event for any li element
 * @param {*} e event
 */
function onProjectClick(e){
    /**@type HTMLLIElement */
    let ct = e.currentTarget;
    if(mediaQuery.matches){
        //handle mobile project clicks
        onProjectClickMobile(e);
    }
    else{
        closeOpenProject();
        e.preventDefault();
        if(ct.classList.contains("closed")){
            ct.classList.remove("closed")
            ct.classList.add("open")
            getTimelineForElement(ct).play()
        }
    }
}

/**
 * Create a timeline for an element
 * @param {HTMLElement} target the element to attach the timeline to
 */
function createTimeline(target){
    //TIMELINE
    let containerWidth = target.parentElement.clientWidth;
    let midContainer = containerWidth / 2;
    let targetRect = target.getBoundingClientRect();    

    //midContainer - parentRect.x will align the left side of the element to center, but since we want mid alignment, we need adjust the animX so it accounts for half the width
    let animX = midContainer - targetRect.x - (targetRect.width / 2);
    //top of destination - top of current project will give distance it needs to travel
    let animY = titleDivRect.top - targetRect.top;
    
    let tl = gsap.timeline( {paused: true, onComplete: animateProject, onCompleteParams: [target.dataset.id]} )
    //ANIMATIONS
    tl.to(target, {x: animX, y: animY, duration: animTime, ease: "linear"});
    tl.to(target, {visibility: "hidden", duration: 0});
    //Add timeline to timelines array
    timelines.push(tl);
}

/**
 * Returns the timeline for a given element
 * @param {*} element 
 * @returns Timeline
 */
function getTimelineForElement(element){
    //get index of project in projects array
    let projIndex = projectsArr.indexOf(element);
    if(mediaQuery.matches){
        //handle mobile timelines
        return mobileTimelines[projIndex];
    }
    //get timeline from timeline array using the index found above
    return timelines[projIndex];
}

/**
 * Called after a project has been click.
 * Animates the project into view and sets text/link data to be displayed
 * @param {string} projId A unique string that identifies a project
 */
function animateProject(projId){
    /** @type Project */
    let projectInfo = projects[projId];

    displayTitle = projectInfo.title;
    displayDescription = projectInfo.description;
    displayGithub = projectInfo.links.github;
    displayInfo = projectInfo.links.info;
    displayWeb = projectInfo.links.web;

    titleSpan.textContent = displayTitle;
    descriptionP.textContent = displayDescription;
    githubLink.href = displayGithub;
    infoLink.href = displayInfo;
    webLink.href = displayWeb;

    projectInfoTimeline = gsap.timeline( {paused: true} );
    projectInfoTimeline.to(titleDiv, {visibility: "visible", duration: 0});
    projectInfoTimeline.to(titleDiv, {width: "100%", duration: animTime});
    projectInfoTimeline.to(titleDiv, {borderRadius: 0, duration: 0.1, ease: "linear"});
    projectInfoTimeline.to(projectInfoWrapper, {display: "block", duration: 0});
    projectInfoTimeline.to(projectInfoWrapper, {height: "auto", duration: animTime});
    projectInfoTimeline.play();
}

/**
 * If there is an open project, close it
 */
function closeOpenProject(){
    let openProject = document.getElementsByClassName("open")[0];
    if (openProject != null){
        openProject.classList.remove("open");
        openProject.classList.add("closed");
        getTimelineForElement(openProject).reverse();
        projectInfoTimeline.pause();
        resetProjectInfo();
    }
}

/**
 * Resets display to its original look/posiiton
 */
function resetProjectInfo(){
    projectInfoWrapper.style.display = "none";
    projectInfoWrapper.style.height = "0px";
    titleDiv.style.visibility = "hidden";
    titleDiv.style.width = setHeightOfHobbyElementialProjWidth + "%";
    titleDiv.style.borderRadius = "1em";

    displayTitle = undefined;

    titleSpan.textContent = "";
    descriptionP.textContent = "";
    githubLink.href = "";
    infoLink.href = "";
    webLink.href = "";
}

/**
 * Round a given number to 2 decimal places
 * Some simpler methods are not reliable in some cases
 * @param {number} num the number to round
 * @returns number
 */
function roundToTwo(num) {
    return +(Math.round(num + "e+2")  + "e-2");
}

function scrollToElement(id){
    document.getElementById(id).scrollIntoView({ 
        behavior: 'smooth' 
    });
}

/**
 * Set the height of the given element to half the height of the second element
 * @param {HTMLElement} element1 the element to set the height of
 * @param {HTMLElement} element2 the element to base the height off of
 */
function setHalfHeight(element1, element2){
    element1.style.minHeight = element2.clientHeight / 2 + "px";
    element1.style.maxHeight = element2.clientHeight / 2 + "px";
}

/**
 * Sets the height of hobbyWrapper element and the svg elements inside
 */
function setHeightOfHobbyElement(){
    setHalfHeight(document.getElementById("hobbiesWrapper"), document.getElementsByClassName("hobbies-container")[0]);
    setHalfHeight(document.getElementsByClassName("hobby-svg")[0], document.getElementById("hobbiesWrapper"));
    setHalfHeight(document.getElementsByClassName("hobby-svg")[1], document.getElementById("hobbiesWrapper"));
    setHalfHeight(document.getElementsByClassName("hobby-svg")[2], document.getElementById("hobbiesWrapper"));
}

/**
 * Create the nav
 * @param {bool} mobile is the device mobile
 */
function createNav(mobile){
    if(mobile){
        hamburger.parentElement.style.display = "flex";
        hamburger.parentElement.insertAdjacentHTML('afterend', `
        <nav class="nav-small" style="display: none;">
            <ul class="nav-list">
                <li id="closeNav">&#x2715;</>
                <li id="aboutBtn" class="nav-list-item">About</li>
                <li id="servicesBtn" class="nav-list-item">Services</li>
                <li id="projectsBtn" class="nav-list-item">Projects</li>
                <li id="contactBtn" class="nav-list-item">Contact</li>
            </ul>
        </nav>`);
    }
    else{
        hamburger.parentElement.style.display = "none";
        hamburger.parentElement.insertAdjacentHTML('beforebegin', `
        <nav class="flex-child nav-large">
            <ul class="nav-list">
                <li id="aboutBtn" class="nav-list-item">About</li>
                <li id="servicesBtn" class="nav-list-item">Services</li>
                <li id="projectsBtn" class="nav-list-item">Projects</li>
                <li id="contactBtn" class="nav-list-item">Contact</li>
            </ul>
        </nav>`);
    }
}















/* MOBILE CODE */

hamburger.addEventListener('click', openMobileNav);
if (mediaQuery.matches){
    document.getElementById("closeNav").addEventListener('click', closeMobileNav);
}

/**
 * Called when a project is clicked on a mobile device
 */
 function onProjectClickMobile(e){
    //Create an element to hold the data
    let infoid = e.currentTarget.dataset.id;
    let infoDiv = document.getElementById("info" + infoid);
    let tl = getTimelineForElement(e.currentTarget);
    if(infoDiv.style.display == "none"){
        e.currentTarget.style.color = "black";
        e.currentTarget.style.backgroundColor = "hsl(317 100% 54%)";
        e.currentTarget.style.boxShadow = "0 0 1em 0.1em hsl(317 100% 54%)";
        console.log("playing");
        tl.play();
    }
    else{
        e.currentTarget.style.color = "hsl(317 100% 54%)";
        e.currentTarget.style.backgroundColor = "transparent";
        e.currentTarget.style.boxShadow = "none";
        console.log("reversing");
        tl.reverse();
    }
} 

/**
 * Create the more info section for a project
 * @param {HTMLElement} projectDiv the project div to place the info section under
 * @param {string} projId the project id of the project to create the info section for
 */
function createProjectInfoMobile(projectDiv, projId){
    /** @type Project */
    const project = projects[projId];
    const markup =
    `
    <div id="info${projId}" class="mobile-project-info" data-infoid="${projId}" class="flex-column flex-center" style="display: none;">
        <p>${truncateMobileText(project.description)}</p>
        <div class="full-width flex-row flex-end icon-wrapper">
            <a title="View code on Github" href="${project.links.github}">
                <svg class="project-link-svg" fill="#2196f3" enable-background="new 0 0 24 24" height="512" viewBox="0 0 24 24" width="512" xmlns="http://www.w3.org/2000/svg">
                    <path d="m12 .5c-6.63 0-12 5.28-12 11.792 0 5.211 3.438 9.63 8.205 11.188.6.111.82-.254.82-.567 0-.28-.01-1.022-.015-2.005-3.338.711-4.042-1.582-4.042-1.582-.546-1.361-1.335-1.725-1.335-1.725-1.087-.731.084-.716.084-.716 1.205.082 1.838 1.215 1.838 1.215 1.07 1.803 2.809 1.282 3.495.981.108-.763.417-1.282.76-1.577-2.665-.295-5.466-1.309-5.466-5.827 0-1.287.465-2.339 1.235-3.164-.135-.298-.54-1.497.105-3.121 0 0 1.005-.316 3.3 1.209.96-.262 1.98-.392 3-.398 1.02.006 2.04.136 3 .398 2.28-1.525 3.285-1.209 3.285-1.209.645 1.624.24 2.823.12 3.121.765.825 1.23 1.877 1.23 3.164 0 4.53-2.805 5.527-5.475 5.817.42.354.81 1.077.81 2.182 0 1.578-.015 2.846-.015 3.229 0 .309.21.678.825.56 4.801-1.548 8.236-5.97 8.236-11.173 0-6.512-5.373-11.792-12-11.792z"/>
                </svg>
            </a>
            <a title="More Information" href="${project.links.info}">
                <svg class="project-link-svg" fill="#2196f3" enable-background="new 0 0 330 330" version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" height="512" viewBox="0 0 330 330" xml:space="preserve">
                    <g>
                        <path d="M165,0C74.019,0,0,74.02,0,165.001C0,255.982,74.019,330,165,330s165-74.018,165-164.999C330,74.02,255.981,0,165,0z
                            M165,300c-74.44,0-135-60.56-135-134.999C30,90.562,90.56,30,165,30s135,60.562,135,135.001C300,239.44,239.439,300,165,300z"/>
                        <path d="M164.998,70c-11.026,0-19.996,8.976-19.996,20.009c0,11.023,8.97,19.991,19.996,19.991
                            c11.026,0,19.996-8.968,19.996-19.991C184.994,78.976,176.024,70,164.998,70z"/>
                        <path d="M165,140c-8.284,0-15,6.716-15,15v90c0,8.284,6.716,15,15,15c8.284,0,15-6.716,15-15v-90C180,146.716,173.284,140,165,140z
                            "/>
                    </g>
                </svg>
            </a>
            <a title="Go to website" href="${project.links.web}">
                <svg class="project-link-svg" fill="#2196f3" id="Layer_1" enable-background="new 0 0 512.418 512.418" height="512" viewBox="0 0 512.418 512.418" width="512" xmlns="http://www.w3.org/2000/svg">
                    <path d="m437.335 75.082c-100.1-100.102-262.136-100.118-362.252 0-100.103 100.102-100.118 262.136 0 362.253 100.1 100.102 262.136 100.117 362.252 0 100.103-100.102 100.117-262.136 0-362.253zm-10.706 325.739c-11.968-10.702-24.77-20.173-38.264-28.335 8.919-30.809 14.203-64.712 15.452-99.954h75.309c-3.405 47.503-21.657 92.064-52.497 128.289zm-393.338-128.289h75.309c1.249 35.242 6.533 69.145 15.452 99.954-13.494 8.162-26.296 17.633-38.264 28.335-30.84-36.225-49.091-80.786-52.497-128.289zm52.498-160.936c11.968 10.702 24.77 20.173 38.264 28.335-8.919 30.809-14.203 64.712-15.452 99.954h-75.31c3.406-47.502 21.657-92.063 52.498-128.289zm154.097 31.709c-26.622-1.904-52.291-8.461-76.088-19.278 13.84-35.639 39.354-78.384 76.088-88.977zm0 32.708v63.873h-98.625c1.13-29.812 5.354-58.439 12.379-84.632 27.043 11.822 56.127 18.882 86.246 20.759zm0 96.519v63.873c-30.119 1.877-59.203 8.937-86.246 20.759-7.025-26.193-11.249-54.82-12.379-84.632zm0 96.581v108.254c-36.732-10.593-62.246-53.333-76.088-88.976 23.797-10.817 49.466-17.374 76.088-19.278zm32.646 0c26.622 1.904 52.291 8.461 76.088 19.278-13.841 35.64-39.354 78.383-76.088 88.976zm0-32.708v-63.873h98.625c-1.13 29.812-5.354 58.439-12.379 84.632-27.043-11.822-56.127-18.882-86.246-20.759zm0-96.519v-63.873c30.119-1.877 59.203-8.937 86.246-20.759 7.025 26.193 11.249 54.82 12.379 84.632zm0-96.581v-108.254c36.734 10.593 62.248 53.338 76.088 88.977-23.797 10.816-49.466 17.373-76.088 19.277zm73.32-91.957c20.895 9.15 40.389 21.557 57.864 36.951-8.318 7.334-17.095 13.984-26.26 19.931-8.139-20.152-18.536-39.736-31.604-56.882zm-210.891 56.882c-9.165-5.947-17.941-12.597-26.26-19.931 17.475-15.394 36.969-27.801 57.864-36.951-13.068 17.148-23.465 36.732-31.604 56.882zm.001 295.958c8.138 20.151 18.537 39.736 31.604 56.882-20.895-9.15-40.389-21.557-57.864-36.951 8.318-7.334 17.095-13.984 26.26-19.931zm242.494 0c9.165 5.947 17.942 12.597 26.26 19.93-17.475 15.394-36.969 27.801-57.864 36.951 13.067-17.144 23.465-36.729 31.604-56.881zm26.362-164.302c-1.249-35.242-6.533-69.146-15.452-99.954 13.494-8.162 26.295-17.633 38.264-28.335 30.84 36.225 49.091 80.786 52.497 128.289z"/>
                </svg>
            </a>
        </div>
    </div>
    `;
    projectDiv.insertAdjacentHTML('afterend', markup);
    //Add timeline
    let mobileTL = gsap.timeline( {paused: true} );
    mobileTL.to("#info" + projId, {display: "block", duration: 0, ease: "linear"});
    mobileTL.to("#info" + projId, {height: "auto", duration: 0.1, ease: "linear"}); //Default = animTime = 0.5 is too slow on mobile
    mobileTimelines.push(mobileTL);
}

/**
 * 
 * @param {string} str the string to truncate
 */
function truncateMobileText(str){
    if(str.length >= 200){
        return str.substring(0, maxMobileCharsLength) + '...';
    }
    return str;
}

function closeMobileNav(){
    body.style.overflow = "unset";
    gsap.to(document.querySelector(".nav-small"), {width: "0px", duration: 0.3, ease: "linear"})
    gsap.to(document.querySelector(".nav-small"), {display: "none", duration: 0, delay: 0.3});
}

function openMobileNav(){
    body.style.overflow = "hidden";
    gsap.to(document.querySelector(".nav-small"), {display: "block", duration: 0})
    gsap.to(document.querySelector(".nav-small"), {width: "50%", duration: 0.3, ease: "linear"});
}