'use strict';

// Declare typdefs to be used throughout the project
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




//DECLARE GLOBAL VARS

let projectsColl = document.getElementsByClassName("project"); //Get all elements that have the  "project" class
let projectsArr = Array.from(projectsColl); //Convert HTMLCollection to Array
let timelines = []; //stores all of the GSAP (animation) timelines for each element in the projectsArr
let projectInfoTimeline; //stores the GSAP (animation) timeline for animating the info for a project into view

//Small Screen Vars
const mediaQuery = window.matchMedia('(max-width: 1000px)'); //use this media query to determine if the user is on a mobile device
const hamburger = document.getElementById("hamburger"); //stores the hamburger (menu) image as a variable
let mobileTimelines = [];

//declaring variables that will be used to display the info for a selected project
let displayTitle, displayDescription, displayGithub, displayInfo, displayWeb;

//Must be called before buttons because it involves creating the nav
if(!mediaQuery.matches){
    // user is NOT on a mobile device
    createNav(false); // ( displayMobileNav )
    setHeightOfHobbyElement(); 
    //NOTE: the hobby element is set based on available height, which grows or shrinks depending on screen size
    window.addEventListener("resize", function(e){
        // adjust hobby element on window resize
        setHeightOfHobbyElement();
    })
}
else{
    // user is on mobile device
    createNav(true); // ( displayMobileNav )
}

// "body" element
const body = document.querySelector("body");
// #aboutBtn
const aboutBtn = document.getElementById("aboutBtn");
// #servicesBtn
const servicesBtn = document.getElementById("servicesBtn");
// #projectsBtn
const projectsBtn = document.getElementById("projectsBtn");
// #contactBtn
const contactBtn = document.getElementById("contactBtn");

// #projectInfo, div that holds the project title
const titleDiv = document.getElementById("projectTitle");
// #titleSpan, span used in the title, for styling
const titleSpan = document.getElementById("titleSpan");
// #projectInfoWrapper, div used to wrap all the info for a project
const projectInfoWrapper = document.getElementById("projectInfoWrapper");
// #descriptionP, brief paragraph describing a project
const descriptionP = document.getElementById("descriptionP");
// #githubLink, a tag that links to the github repo for the current project
const githubLink = document.getElementById("githubLink");
// #infoLink, a tag that links to the a page containing more info for the current project
const infoLink = document.getElementById("infoLink");
// #webLink, a tag that links to the website associated with the current project
const webLink = document.getElementById("webLink");

//rectangle surrounding the title div
let titleDivRect = titleDiv.getBoundingClientRect();
const setHeightOfHobbyElementialProjWidth = roundToTwo(titleDivRect.width / body.getBoundingClientRect().width) * 100;







//ADDING EVENT LISTENERS...

aboutBtn.addEventListener("click", function(e){
    //Add "Smooth Scroll" effect
    scrollToElement("about");
    //if its a mobile device
    if (mediaQuery.matches){
        //close the side nav
        closeMobileNav();
    }
});

servicesBtn.addEventListener("click", function(e){
    scrollToElement("whatIDo");
    //if its a mobile device
    if (mediaQuery.matches){
        //close the side nav
        closeMobileNav();
    }
});

projectsBtn.addEventListener("click", function(e){
    scrollToElement("projects");
    //if its a mobile device
    if (mediaQuery.matches){
        //close the side nav
        closeMobileNav();
    }
});

contactBtn.addEventListener("click", function(e){
    scrollToElement("contact");
    //if its a mobile device...
    if (mediaQuery.matches){
        //close the side nav
        closeMobileNav();
    }
});

//loop through all projects...
projectsArr.forEach(element => {
    //if viewing on a mobile device...
    if (mediaQuery.matches){
        //create empty div container to put project info in
        createProjectInfoMobile(element, element.dataset.id);
        //add click event
        element.addEventListener("click", onProjectClickMobile);
    }
    else{
        //add click event
        element.addEventListener("click", onProjectClick);
        //create a GSAP (animation) timeline for the current project
        createTimeline(element);
    }
});

titleDiv.addEventListener("click", function(e){
    //close an open project, if there is one
    closeOpenProject();
    titleSpan.textContent = "";
});
titleDiv.addEventListener("mouseenter", function(e){
    let openProject = document.getElementsByClassName("open")[0];
    //if there is an open project...
    if (openProject != null){
        //set text equal to "close"
        titleSpan.textContent = "Close";
    }
});
titleDiv.addEventListener("mouseleave", function(e){
    //if the display title has a value... 
    if (displayTitle != null){
        //set text to initial value
        titleSpan.textContent = displayTitle;
    }
    else{
        //reset text
        titleSpan.textContent = "";
    }
});

//FINISHED ADDING EVENT LISTENERS





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
        //close open projects
        closeOpenProject();
        e.preventDefault();
        //open project that was clicked on
        if(ct.classList.contains("closed")){
            ct.classList.remove("closed")
            ct.classList.add("open")
            //get the timeline (animation) for the clicked on element and play it
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

    // (midContainer - parentRect.x) will align the left side of the element to the center of the screen, 
    // but since we want to align the middle of the element to the center of the screen,
    // we need to subtract half the width of the element (targetRect.width / 2), this will push it to the center
    let animX = midContainer - targetRect.x - (targetRect.width / 2);
    // (top of destination - top of current project) will give distance it needs to travel in the y
    let animY = titleDivRect.top - targetRect.top;
    //ANIMATIONS
    //0. initialise timeline, disable autoplay, add an onComplete function and pass it a value
    let tl = gsap.timeline( {paused: true, onComplete: animateProject, onCompleteParams: [target.dataset.id]} )
    //1. move the clicked project to the center (horizontally) and slightly below the other projects (vertically), (0.3s)
    tl.to(target, {x: animX, y: animY, duration: animTime, ease: "linear"});
    //2. make the clicked project visible, (instantly)
    tl.to(target, {visibility: "hidden", duration: 0});
    //Add timeline to timelines array
    timelines.push(tl);
}

/**
 * Returns the timeline for a given element
 * @param {HTMLElement} element An HTMLElement that contains the "project" class
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
 * Called after a project has been clicked.
 * Animates the project into view and sets data to be displayed
 * @param {string} projId A unique string that identifies a project in Constants.js
 */
function animateProject(projId){
    /** @type Project */
    let projectInfo = projects[projId]; //Stores a project from the projects object in Constants.js

    displayTitle = projectInfo.title; //title of the project
    displayDescription = projectInfo.description; //brief description of the project
    displayGithub = projectInfo.links.github; //link to github
    displayInfo = projectInfo.links.info; //link to more info page
    displayWeb = projectInfo.links.web; //link to the website

    //Display the values we just got into html...
    titleSpan.textContent = displayTitle;
    descriptionP.textContent = displayDescription;
    githubLink.href = displayGithub;
    infoLink.href = displayInfo;
    webLink.href = displayWeb;

    //Create Animation Timeline
    //0. Declare new timeline, turn autoplay off.
    projectInfoTimeline = gsap.timeline( {paused: true} );
    //1. Make the title visible (instantly)
    projectInfoTimeline.to(titleDiv, {visibility: "visible", duration: 0});
    //2. Set the title width to 100% (animTime)
    projectInfoTimeline.to(titleDiv, {width: "100%", duration: animTime});
    //3. Set the titel border radius to 0 (0.1s)
    projectInfoTimeline.to(titleDiv, {borderRadius: 0, duration: 0.1, ease: "linear"});
    //4. Set the project wrapper display property equal to "Block" (instantly)
    projectInfoTimeline.to(projectInfoWrapper, {display: "block", duration: 0});
    //5. Set the project wrapper height equal to "auto" (animTime)
    projectInfoTimeline.to(projectInfoWrapper, {height: "auto", duration: animTime});
    //Play the animation
    projectInfoTimeline.play();
}

/**
 * If there is an open project, calling this function will close it
 */
function closeOpenProject(){
    //get open project
    let openProject = document.getElementsByClassName("open")[0];
    //if there is an open project...
    if (openProject != null){
        //remove "open" class
        openProject.classList.remove("open");
        //add "closed" class
        openProject.classList.add("closed");
        //get timeline (animation) for the open porject and "undo" it
        getTimelineForElement(openProject).reverse();
        //stop the project info timeline (animation)
        projectInfoTimeline.pause();
        //resets project info to nothing/empty strings
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
 * NOTE: the simpler methods are not reliable
 * @param {number} num the number to round
 * @returns {number} the rounded number
 */
function roundToTwo(num) {
    return +(Math.round(num + "e+2")  + "e-2");
}

/**
 * Auto scroll to the element that contains the passed id
 * @param {String} id 
 */
function scrollToElement(id){
    document.getElementById(id).scrollIntoView({ 
        behavior: 'smooth' 
    });
}

/**
 * Set the height of the given element to half the height of the second element
 * @param {HTMLElement} element1 the element to set the height of
 * @param {HTMLElement} element2 the element to base the height off of, usually the parent of element1
 */
function setHalfHeight(element1, element2){
    element1.style.minHeight = element2.clientHeight / 2 + "px";
    element1.style.maxHeight = element2.clientHeight / 2 + "px";
}

/**
 * Sets the height of #hobbiesWrapper and .hobby-svg are set to half the height of their parent containers
 */
function setHeightOfHobbyElement(){
    setHalfHeight(document.getElementById("hobbiesWrapper"), document.getElementsByClassName("hobbies-container")[0]);
    setHalfHeight(document.getElementsByClassName("hobby-svg")[0], document.getElementById("hobbiesWrapper"));
    setHalfHeight(document.getElementsByClassName("hobby-svg")[1], document.getElementById("hobbiesWrapper"));
    setHalfHeight(document.getElementsByClassName("hobby-svg")[2], document.getElementById("hobbiesWrapper"));
}

/**
 * Create the nav and add it to the DOM
 * @param {boolean} mobile true to create the mobile nav, false to create the regular nav
 */
function createNav(mobile){
    if(mobile){
        //show hamburger
        hamburger.parentElement.style.display = "flex";
        //the parent element is the right half of the header
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
        //hide hamburger
        hamburger.parentElement.style.display = "none";
        //the parent element is the right half of the header
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
//if viewing on a mobile device...
if (mediaQuery.matches){
    document.getElementById("closeNav").addEventListener('click', closeMobileNav);
}

/**
 * Called when a project is clicked on a mobile device
 */
 function onProjectClickMobile(e){
    //get the id stored in data-id from the element that was clicked on
    let infoid = e.currentTarget.dataset.id;
    //use the id to get the info div
    let infoDiv = document.getElementById("info" + infoid);
    //get the timeline (animation) for the the element that was clicked on
    let tl = getTimelineForElement(e.currentTarget);
    //if the info div is not being displayed...
    if(infoDiv.style.display == "none"){
        //display the info div
        e.currentTarget.style.color = "black";
        e.currentTarget.style.backgroundColor = "hsl(317 100% 54%)";
        e.currentTarget.style.boxShadow = "0 0 1em 0.1em hsl(317 100% 54%)";
        tl.play();
    }
    else{
        //hide the info div
        e.currentTarget.style.color = "hsl(317 100% 54%)";
        e.currentTarget.style.backgroundColor = "transparent";
        e.currentTarget.style.boxShadow = "none";
        tl.reverse();
    }
} 

/**
 * Create the more info section for a project
 * @param {HTMLElement} projectDiv the project div to place the info section under
 * @param {string} projId the project id of the project to create the info section for
 */
function createProjectInfoMobile(projectDiv, projId){
    //get the project from projects Object in Costants.js
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
    //add the above html to the dom
    projectDiv.insertAdjacentHTML('afterend', markup);
    //Create the timeline (animation) for mobile
    //0. initialise timeline, disabling autoplay
    let mobileTL = gsap.timeline( {paused: true} );
    //1. Set the info div to display "block", (instantly)
    mobileTL.to("#info" + projId, {display: "block", duration: 0, ease: "linear"});
    //2.0 Set the info div to height "auto", (mobileAnimTime)
    mobileTL.to("#info" + projId, {height: "auto", duration: mobileAnimTime, ease: "linear"});
    //add this timeline to the mobileTimelines array
    mobileTimelines.push(mobileTL);
}

/**
 * Shorten the description text for mobile devices and add .. to the end
 * @param {string} str the string to truncate
 */
function truncateMobileText(str){
    if(str.length >= 200){
        return str.substring(0, maxMobileCharsLength) + '...';
    }
    return str;
}

/**
 * Animates the nav into view
 */
function closeMobileNav(){
    //reset overflow style for the body to allow for scrolling
    body.style.overflow = "unset";
    // set width of mobile nav to 0px (0.3s)
    gsap.to(document.querySelector(".nav-small"), {width: "0px", duration: 0.3, ease: "linear"})
    // set display to none (happens instantly, but is delayed by 0.3s, so the above animation can finish)
    gsap.to(document.querySelector(".nav-small"), {display: "none", duration: 0, delay: 0.3});
}

/**
 * Animates the nav out of view
 */
function openMobileNav(){
    //set overflow style to hidden on the body so you cant scroll the page while the nav is open
    body.style.overflow = "hidden";
    // set display to block (instantly)
    gsap.to(document.querySelector(".nav-small"), {display: "block", duration: 0})
    // set width of mobile nav to 50% (0.3s)
    gsap.to(document.querySelector(".nav-small"), {width: "50%", duration: 0.3, ease: "linear"});
}