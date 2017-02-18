var app = angular.module("projectsApp",['ngMaterial', 'ngCookies'])

app.controller("ProjectListCtrl", function($scope, $http, $cookies){
    
    var host = 'https://api-test-task.decodeapps.io';
    var tasksPageSize = 10;
    var ProjectID;
    var task_id;

    authenticate();
    
    $scope.isLoading = true;
    $scope.updtTaskForm = false;
    $scope.showAddForm = false;
    $scope.showUpdateForm = false;

    $scope.projectTitleinput = "";
    $scope.projectTitleinputUpdate = "";
    

    $scope.inpetTaskTitlrUpdate ="";
    $scope.InputTaskDiscr="";

    $scope.TaskTitleinput ="";
    $scope.TaskDiscrinput =""

    $scope.openMenu = function($mdMenu, ev) {
      $mdMenu.open(ev);
    };


    $scope.selectProject = function(projectId){
        $scope.currentProjectId = projectId;
        getProjectTasks(projectId, 0);  
    };

    $scope.createpjDialog = function() {
        $scope.showAddForm = true;
    };

    $scope.addPro = function(){
        addProject($scope.projectTitleinput);
    };

    $scope.popUpDialogClose = function(){
        $scope.showAddForm = false;
    };

    $scope.updateFormOpen = function(projectID) {
        ProjectID = projectID;
        $scope.showUpdateForm = true;
    };

    $scope.updateformClose = function(){
        $scope.showUpdateForm = false;
    };

    $scope.updateProj = function(){
        updateProject(ProjectID, $scope.projectTitleinputUpdate);
    };


    $scope.deleteProject = function(projectId) {

        var data = {
            session: $scope.session,
            project_id: projectId
        };
        
        makeRequest('delete', '/projects/project', data, null,
            function(response){
                $scope.prDel = response;
                loadProjects();
            }
        );
    };

    $scope.addTaskForCurrentProject = function() {

        var data = {
            Project: {
                 id: $scope.currentProjectId
            },
            Task: {
                title: $scope.TaskTitleinput,
                description: $scope.TaskDiscrinput
            }
        };
        
        makeRequest('post', '/tasks/task', null, data,
            function(response){
                $scope.AddtaskAns = response;
                loadProjects();
                getProjectTasks($scope.currentProjectId, 0);
            }
        );

        $scope.addTaskFormClose();
    };

    $scope.openUpdateForm = function(t_Id){
        task_id = t_Id;
        $scope.updtTaskForm = true;   
    };

    $scope.updTaskFormClose = function(){
        $scope.updtTaskForm = false;
    }

    $scope.updateTask = function() {         
        
        var data = {
            Task: {
                id: task_id,
                title: $scope.inpetTaskTitlrUpdate,
                description: $scope.InputTaskDiscr
          }
        };
        
        makeRequest('post', '/tasks/task', null, data,
            function(response){
                $scope.updtaskAns = response.data;
                getProjectTasks($scope.currentProjectId, 0);
                $scope.updtTaskForm = false;
                
            }
        );
    };

    $scope.deleteTaskCurrent = function(taskId){ 
        deleteTask(taskId);
    };



    /*----------other function-------------------------*/
    
    
    function authenticate() {
        $scope.session = getLocalSessionKey();
        
        if ($scope.session) {
            load();
        }
        else {
            requestSessionKey();
        }
    }
    
    function getLocalSessionKey() {
        // return $cookies.get('session');
        return localStorage['session'];
    }
    
    function setLocalSessionKey(sessionKey) {
        
        $scope.session = sessionKey;
        
        // return $cookies.get('session');
        localStorage['session'] = sessionKey;
    }
    
    function makeRequest(method, url, params, data, onSuccess) {
        
        $scope.isLoading = true;
        
        url = host + url;
        
        if ($scope.session)
        {
            if (method == 'get') {
                if (!params) {
                    params = {};
                }
                
                params.session = $scope.session;
            }
            else {
                if (!data) {
                    data = {};
                }
                
                data.session = $scope.session;
            }
        }
        
        $http({
            method: method,
            url: url,
            params: params,
            data: data
        })
        .success(function(response) {
            if (onSuccess) {
                onSuccess(response);
            }
            
            $scope.isLoading = false;
        }, onRequestError);
    };
    

    function onRequestError(response) {
        $scope.session = response.data || 'Request failed';
        $scope.status = response.status;
    };
    

    function requestSessionKey() {
        makeRequest('post', '/signup', null, null,
            function(response) {
                setLocalSessionKey(response.data.session);
                load();
            }
        );
    };
    

    function load() {
        onSessionReceived();
        loadAccount();
        loadProjects();
    };


    function onSessionReceived() {
        makeRequest('get', '/session', null, null,
            function(response){
                if (response) {
                    $scope.checksession = true;
                }
                else {
                    $scope.checksession = false;
                }
            }
        );
    };


    function loadAccount(){
        makeRequest('get', '/account',null, null,
            function(response){
                $scope.account = response.Account;
            }
        );
    };


    function loadProjects(){
        makeRequest('get', '/projects', null, null,
            function(response){
                $scope.projects = response;
            }
        );
    };

    function addProject(projtitle) {         
    
        var data = {
            Project: {
                title: projtitle
            }
        };
        
        makeRequest('post', '/projects/project', null, data,
            function(response){
                $scope.Addprojects = response; 
                loadProjects();
            }
        );
            
        $scope.showAddForm = false;
    };

    function getProjectTasks(projectId, pagingOffset) {

        var data = {
            project_id: projectId,
            paging_size : tasksPageSize,
            paging_offset: pagingOffset
        };
        
        makeRequest('get', '/tasks', data, null,
            function(response){
                $scope.Tasks = response.tasks;
            }
        );
    };    


    function updateProject(projectId, Projecttitle) {

        var data = {
            Project: {
                id: projectId,
                title: Projecttitle
            }
        };
        
        makeRequest('post', '/projects/project', null, data,
            function(response){
                $scope.prUpd = response.data;
                $scope.showUpdateForm = false;
                loadProjects();
            }
        );
    };

    var deleteTask = function(taskId) {

        var data = {
            session: $scope.session,
            task_id: taskId
        };
        
        makeRequest('delete', '/tasks/task', data, null,
            function(response){
                $scope.TS_Del = response;
                getProjectTasks($scope.currentProjectId, 0);
                loadProjects();
            }
        );
    };

    /*-------------other function-----------------------*/

    document.getElementById('view-source').onclick= function(){
        var addPRForm = document.getElementById("addTSk");
        addPRForm.style.display = "block";
    };

    $scope.addTaskFormClose = function(){
        var addPRFormN = document.getElementById("addTSk");
        addPRFormN.style.display = "none";
    };
});
