var app = angular.module('myApp', ['ngRoute']);

// configure our routes
app.config(function ($routeProvider) {
    $routeProvider
    //route for splash
    .when('/', {
        templateUrl: 'splash.html'
    //controller: 'loginController'
    })
    // route for the login page
    .when('/login', {
        templateUrl: 'login.html',
        controller: 'loginController'
    })
    // route for the home page
    .when('/home', {
        templateUrl: 'landing.html',
        controller: 'landingController'
    })
    // route for the home page
    .when('/survey/:survey_id?', {
        templateUrl: 'survey.html',
        controller: 'surveyController'
    })
    //route for the reports page
    .when('/reports',{
        templateUrl: 'reports.html',
        controller: 'reportsController'
    })
    //route for the register page
    .when('/register',{
        templateUrl: 'register.html',
        controller: 'registerController'
    })
    //route for the forgot password page
    .when('/forgot-password',{
        templateUrl: 'forgot-password.html',
        controller: 'forgotPasswordController'
    }).
    otherwise({
        redirectTo: '/home'
    });
});


app.controller('loginController', ['$scope', '$window', '$http', '$rootScope' ,function ($scope, $window, $http, $rootScope) {
 
    $scope.loginSubmit = function(isValid) {
        $scope.submitted = true;
        var tableCreationStatus = localStorage.getItem("tableCreationStatus");

        dropAllTables();

        if(isValid) {
          $scope.loading = true;
          var userLogin = {};
          localStorage.setItem("userId", $scope.userName);
          localStorage.setItem("password", $scope.password);
          userLogin['userId'] = localStorage.getItem('userId');
          userLogin['password'] = localStorage.getItem('password');
          userLogin['loginFlag']="L";
          userLogin['token']='';

          var loginURL= "http://rocuat.tmf.co.in/SageAppProj/resources/genericResource/login";
          var networkState = '';
          if (navigator.connection == null) {
               networkState ="unknown";
            }
            else {
                networkState = navigator.connection.type;
            } 

            //if (networkState == "2g" || networkState == "3g" || networkState == "4g"|| networkState == "wifi" || networkState == "unknown") {
            if (networkState == "2g" || networkState == "3g" || networkState == "4g" || networkState == "wifi") {
                $http.post(loginURL, userLogin).
                success(function (data) {
                    if(data.responseStatus == "SUCCESS") {
                      localStorage.setItem("userName", data.bdmName);
                      var getSurveyDataUrl= "http://rocuat.tmf.co.in/Survey/route/getSurvey/" + $scope.userName;
                      $http.get(getSurveyDataUrl, '').
                            success(function (data) {
                                if(data.message == "Success") {
                                  var surveyData = data.surveyData;
                                  localStorage.setItem('surveyData', JSON.stringify(surveyData));
                                  insertIntoSurveyMaster();
                                  setTimeout(function() {
                                    $scope.loading = true;
                                    generateJson();
                                  }, 2000);
                                  
                                  setTimeout(function() {
                                    $scope.loading = true;
                                     localStorage.setItem('reloadCountValue', '');
                                    localStorage.setItem('reloadCountValueSurvey', '');
                                    localStorage.setItem('HomeReloadStatus', 'true');
                                    $window.location.href = "#/home";
                                  }, 2000);
                                } 
                            });
                    } else if(data.responseStatus == "FAIL") {
                      $scope.loading = false;
                      alert('Please enter correct Username and Password.');
                    }
                });
            }
            else if(networkState == "none" || networkState == "unknown")
            {
                $scope.loading = false;
                alert('Please check your internet connection and try again.');
            }

        }
    }
   
}]);

app.controller('landingController', ['$scope', '$window', '$http', '$rootScope', '$parse', function ($scope, $window, $http, $rootScope, $parse) {
  $scope.loading = true;
  localStorage.setItem('reloadCountValueSurvey', '');
  var homeReloadStatus = localStorage.getItem('HomeReloadStatus');
  if(homeReloadStatus == 'true') {
    setTimeout(function() {
      localStorage.setItem('HomeReloadStatus', 'false');
      //$scope.loading = false;
      $window.location.reload();      
    }, 1000);
  } else {
    $scope.loading = false;
  }

 
  $scope.title = "My Surveys";

  $scope.surveyData = JSON.parse(localStorage.getItem('surveyData'));

  var reloadCountvalue = localStorage.getItem('reloadCountValue');
  if(reloadCountvalue != 'undefined' && reloadCountvalue != null) {
    var reloadCount = reloadCountvalue;
  } else {
    var reloadCount = 1;
  }

  if(reloadCount == '8') { 
    localStorage.setItem('reloadCount', 'true');
  } else if($scope.surveyData.length == 0 || $scope.surveyData.length == 'undefined' || $scope.surveyData.length == null || $scope.surveyData == '') {
     localStorage.setItem('reloadCountValue', ++reloadCount);
     localStorage.setItem('reloadCount', 'false');
     $scope.loading = true;
     setTimeout(function() {
       $window.location.reload();
     }, 1000);
   }

   var reloadCountStatus = localStorage.getItem('reloadCount');

   $scope.reloadCount = false;
   if(reloadCountStatus == 'true') {
    localStorage.setItem('reloadCount', 'false');
    $scope.reloadCount = true;
   }

  generateJson();

  $scope.surveyMainPage = function(surveyId) { 
    $scope.loading = true;
    setTimeout(function() {
      $window.location.href = "#/survey/" + surveyId; 
    }, 2000);
  }

  $scope.sync = function() {
    $scope.loading = true;
    updateAnswerOnServer(localStorage.getItem('userId'));

    setTimeout(function() {
      var data = JSON.parse(localStorage.getItem('answerObject'));
            var submitSurveyUrl= "http://rocuat.tmf.co.in/Survey/route/submitanswer";
            var networkState = '';
            if (navigator.connection == null) {
               networkState ="unknown";
            }
            else{
                networkState = navigator.connection.type;
            }    

            //if (networkState == "2g" || networkState == "3g" || networkState == "4g"|| networkState == "wifi" || networkState == "unknown") {
            if (networkState == "2g" || networkState == "3g" || networkState == "4g"|| networkState == "wifi") {
                $http.post(submitSurveyUrl, data).
                success(function (data) {
                  $scope.loading = false;
                    if(data.message == "Success") {
                      var surveyList = (data.SurveyId).split(',');
                      var uniqueSurveyList = [];
                      $.each(surveyList, function(i, el){
                          if($.inArray(el, uniqueSurveyList) === -1) uniqueSurveyList.push(el);
                      });
                      for(var i = 0; i < uniqueSurveyList.length; i++) {
                        updateSurveySyncStatus(uniqueSurveyList[i]);
                      }
                      generateJson();

                         $scope.loading = true;
                         setTimeout(function() {
                           $window.location.reload();
                         }, 1000);

                    } else if(data.message == "No Data to upload") {
                      alert('No data to sync.');
                    } 
                    else if(data.message == "Failure") {
                      alert('Sync unsuccessful. Please try again.');
                    }
                });
            }
            else if(networkState == "none" || networkState == "unknown")
            {
                alert('Please check your internet connection and try again');
                $scope.loading = false;
            }
            $scope.loading = false;
    }, 5000);
  }

  $scope.logout = function() {
    var confirmLogout = confirm("Are you sure you want to Logout?");
    if(confirmLogout) {
       localStorage.setItem('reloadCountValue', '');
      localStorage.setItem('reloadCountValueSurvey', '');
      $window.location.href = "#/login"
    }
  }
   
}]);

app.controller('surveyController', ['$scope', '$window', '$rootScope', '$routeParams', 'saveResult', 'progressStatus', '$http', '$route', function ($scope, $window, $rootScope, $routeParams, saveResult, progressStatus, $http, $route) {

  $scope.surveyData = JSON.parse(localStorage.getItem('surveyData'));
  console.log($scope.surveyData);
   generateJson();

    localStorage.setItem('reloadCountValue', '');

   var reloadCountvalue = localStorage.getItem('reloadCountValueSurvey');
  if(reloadCountvalue != 'undefined' && reloadCountvalue != null) {
    var reloadCountSurvey = reloadCountvalue;
  } else {
    var reloadCountSurvey = 1;
  }

  if(reloadCountSurvey == '8') { 
    localStorage.setItem('reloadCountSurvey', 'true');
  } else if($scope.surveyData.length == 0 || $scope.surveyData.length == 'undefined' || $scope.surveyData.length == null || $scope.surveyData == '') {
     localStorage.setItem('reloadCountValueSurvey', ++reloadCountSurvey);
     localStorage.setItem('reloadCountSurvey', 'false');
     $scope.loading = true;
     setTimeout(function() {
       $window.location.reload();
     }, 1000);
   }

   var reloadCountStatus = localStorage.getItem('reloadCountSurvey');

   $scope.reloadCountSurvey = false;
   if(reloadCountStatus == 'true') {
    localStorage.setItem('reloadCountSurvey', 'false');
    $scope.reloadCountSurvey = true;
   }

    $scope.surveyId = $routeParams.survey_id;

    $('#myTabs a').click(function (e) {
      e.preventDefault();
      $(this).tab('show');

      var id = $(this).text();

      $('#form' + id).find('.options-wrapper').children('.option').each(function() {
        if($(this).hasClass('active')) {
          $(this).children('input').prop('checked', true);
        }
      });

    });

    $scope.clickNonApplicable = function($event) {
      if($(event.target).prop("tagName") != "DIV") {
        $(event.target).parents('.not-applicable-btn-wrapper').next('.options-wrapper').children('.option').each(function() {
          var _this = $(this);
          if($(this).children('input').prop('checked') == true) {
            _this.removeClass('active');
            $(this).children('input').prop('checked', false)
          }
        });

        $(event.target).parents('.not-applicable-btn-wrapper').next('.options-wrapper').next('.remarks-textbox-wrapper').children('textarea.remarks-textbox').val('');
        
        $(event.target).parents('.not-applicable-btn-wrapper').next('.options-wrapper').children('textarea.free-text').val('');

        $(event.target).parents('.not-applicable-btn-wrapper').next('.options-wrapper').next('.remarks-textbox-wrapper').fadeOut();
      }
      
      var totalAnswerCount = 0;
          $('input:radio').each(function() {
            if($(this).is(':checked')) {
              var checkRemarks = $(this).parents('.options-wrapper').next('.remarks-textbox-wrapper');
              if(checkRemarks.css('display') == 'block') {
                if(checkRemarks.children('.remarks-textbox').val()) {
                  totalAnswerCount++;
                }
              } else {
                totalAnswerCount++;
              }
            }
          });

          $('textarea.free-text').each(function() {
            if($(this).val() != '') {
              totalAnswerCount++;
            }
          });

          $('.not-applicable-btn-wrapper input').each(function() {
            if($(this).prop('checked') == true) {
              totalAnswerCount++;
            }
          });

          if(totalAnswerCount == $scope.questionCount) {
            $('button.submit-survey-btn').removeAttr('disabled');
            $('.remarks-textbox-wrapper').each(function() {
              if($(this).css('display') == 'block') {
                if($(this).children('.remarks-textbox').val() != '') {
                  $('button.submit-survey-btn').removeAttr('disabled');
                } else {
                  $('button.submit-survey-btn').attr('disabled', 'disabled');
                }
              }
            });
          } else {
            $('button.submit-survey-btn').attr('disabled', 'disabled');
          }
          progressStatus.update(totalAnswerCount, $scope.questionCount);
    }

    $scope.questionCount = 0;
    $scope.answerCount = 0;
    angular.forEach($scope.surveyData, function (value, index) {
          if(value.surveyId == $scope.surveyId) {
              $scope.title = value.surveyName;
              angular.forEach(value.questionList, function (questionValue, questionIndex) {
                $scope.questionCount++;
                if(questionValue.answer != null && questionValue.answer != '') {
                  $scope.answerCount++;
                  setTimeout(function() {

                    if(questionValue.answer == '1' || questionValue.answer == '2' || questionValue.answer =='3' || questionValue.answer =='4' || questionValue.answer == '5') {
                      var _this = $('#q' + questionValue.questionId + '-opt' + questionValue.answer);
                      _this.prop('checked', true).parent('.option').addClass('active');

                      if(questionValue.remarks || (questionValue.answer == '1' || questionValue.answer == '2')) {
                        $('#remarks-textarea'+questionValue.questionId).val(questionValue.remarks);
                        $('#remarks-textarea'+questionValue.questionId).parent('.remarks-textbox-wrapper').fadeIn();
                      }
                    } else {
                      var _this = $('#textarea' + questionValue.questionId);
                      _this.val(questionValue.answer);
                    }
                  }, 10);
                }

                
                  if(questionValue.notApplicable == '1') {
                    $scope.answerCount++;
                    setTimeout(function() {
                      $('#notapplicable'+questionValue.questionId).prop('checked', true);
                    }, 10);
                  }
                
              });
          }
      });
     
    progressStatus.update($scope.answerCount, $scope.questionCount);

    $scope.checkOption = function($event, ans) {

      if($(event.target).parents('.question-wrapper').find('.not-applicable-btn-wrapper').find('input').prop('checked') == true) {
        $(event.target).parents('.question-wrapper').find('.not-applicable-btn-wrapper').find('input').prop('checked', false);
      }

        $('.options-wrapper').each(function() {
          $(this).children('.option').each(function() {
            if($(this).hasClass('active')) {
              $(this).children('input').prop('checked', true);
            }
          });
        });

        var _this = event.target;
        var inputValue;
        $(_this).parents('.options-wrapper').children('.option').removeClass('active');
        if($(_this).prop("tagName") == 'LABEL' || $(event.target).prop("tagName") == 'INPUT' || $(event.target).prop("tagName") == 'SPAN') {
            $(_this).parent('.option').addClass('active');
            inputValue = $(_this).parent('.option').children('input').val();
        } else if($(_this).prop("tagName") == 'DIV') {
            $(_this).addClass('active');
            inputValue = $(_this).children('input').val();
        }

        var remarksTextArea = $(_this).parents('.question-wrapper').find('.remarks-textbox-wrapper');
        if(inputValue == 1 || inputValue == 2) {
          remarksTextArea.fadeIn();
        } else {
          remarksTextArea.fadeOut();
          remarksTextArea.children('.remarks-textbox').val('');
        }

        var totalAnswerCount = 0;

        setTimeout(function() {
        $('input:radio').each(function() {
          if($(this).is(':checked')) {
            var checkRemarks = $(this).parents('.options-wrapper').next('.remarks-textbox-wrapper');
            if(checkRemarks.css('display') == 'block') {
              if(checkRemarks.children('.remarks-textbox').val()) {
                totalAnswerCount++;
              }
            } else {
              totalAnswerCount++;
            }
          }
        });

        $('textarea.free-text').each(function() {
          if($(this).val() != '') {
            totalAnswerCount++;
          }
        });

        $('.not-applicable-btn-wrapper input').each(function() {
            if($(this).prop('checked') == true) {
              totalAnswerCount++;
            }
          });

        if(totalAnswerCount == $scope.questionCount) {
          $('button.submit-survey-btn').removeAttr('disabled');
          $('.remarks-textbox-wrapper').each(function() {
            if($(this).css('display') == 'block') {
              if($(this).children('.remarks-textbox').val() != '') {
                $('button.submit-survey-btn').removeAttr('disabled');
              } else {
                $('button.submit-survey-btn').attr('disabled', 'disabled');
              }
            }
          });
        } else {
          $('button.submit-survey-btn').attr('disabled', 'disabled');
        }

        progressStatus.update(totalAnswerCount, $scope.questionCount);
        }, 50);

      

    }

    $scope.tabList = function(ans) {
      saveResult.save(ans, $scope.surveyId, '');
      if($scope.answerCount == $scope.questionCount) {
        $('button.submit-survey-btn').removeAttr('disabled');
      } else {
        $('button.submit-survey-btn').attr('disabled', 'disabled');
      }
    }

    setTimeout(function() {
      $('.tab-content .tab-pane').each(function() {
        var form = parseInt(($(this).attr('id').split('form')[1]), 10) + 1;
        progressStatus.checkCompleted('', form, $(this));
      });
    }, 100);

    $scope.triggerClick = function() {
      $(event.target).parent('.remarks-textbox-wrapper').prev('.options-wrapper').children('.option').each(function() {
        if($(this).children('input').prop('checked') == true) {
          $(this).children('input').trigger('click');
        }
      });
    };

    $scope.ans = {};

    $scope.openNextForm = function($event, ans) {
      $('.tab-content').scrollTop(0);
      generateJson();

      angular.forEach(ans, function(value, index) {
        var remarks = $('#remarks-textarea'+index).val();
        if(remarks) {
         ans[index] = ans[index] + "&;" + remarks;
        }
      });

      saveResult.save(ans, $scope.surveyId, '');
      $('.tab-pane').removeClass('active');
      $('.page-number-wrapper li').removeClass('active');
      var formId = $(event.target).attr('form-id');
      var formNumber = $(event.target).attr('form-number');
      $(" #" + formId).addClass('active');
      $(".page-number-wrapper li:nth-child(" + formNumber + ")").addClass('active');

      if($scope.answerCount == $scope.questionCount) {
        $('.remarks-textbox-wrapper').each(function() {
          $('button.submit-survey-btn').removeAttr('disabled');
          if($(this).css('display') == 'block') {
            if($(this).children('.remarks-textbox').val() != '') {
              $('button.submit-survey-btn').removeAttr('disabled');
            } else {
              $('button.submit-survey-btn').attr('disabled', 'disabled');
            }
          }
        });
      } else {
        $('button.submit-survey-btn').attr('disabled', 'disabled');
      }

      progressStatus.checkCompleted($event, formNumber, '');
    }

    $scope.submitSurvey = function(ans, type) {
      localStorage.setItem('score'+$scope.surveyId, '');
      $('body').scrollTop(0);
      $scope.loading = true;
      
      setTimeout(function() {
        generateJson();
      }, 50);

      setTimeout(function() {
        $scope.graphData = JSON.parse(localStorage.getItem('surveyData'));

        var categoryList = [];
        angular.forEach($scope.graphData, function(value, index) {
          
          if(value.surveyId == parseInt($scope.surveyId, 10)) {
            angular.forEach(value.categoryList, function(categoryValue, categoryIndex) {
              if(categoryValue.categoryName != 'Others') {
                  var categoryObj = {
                    'categoryId': categoryValue.categoryId,
                    'categoryName': categoryValue.categoryName,
                    'categoryCount': 0
                  }
                  categoryList.push(categoryObj);
              }

            });
          }
        });

        var tempCategoryValue;
        var count = 0;
        var totalCategoryValueArr = [];
        angular.forEach($scope.graphData, function(value, index) {
          if(value.surveyId == parseInt($scope.surveyId, 10)) {
            angular.forEach(value.questionList, function(questionValue, questionIndex) {
                angular.forEach(categoryList, function(categoryValue, categoryIndex) {
                  if(categoryValue.categoryId == questionValue.categoryId) {
                    if(questionValue.answer == '1' || questionValue.answer == '2' || questionValue.answer == '3' || questionValue.answer == '4' || questionValue.answer == '5') {
                      categoryValue.categoryCount = parseInt(categoryValue.categoryCount, 10) + 1;
                    }
                  }
                });

                if(questionValue.answer == '1' || questionValue.answer == '2' || questionValue.answer == '3' || questionValue.answer == '4' || questionValue.answer == '5') {
                  if(totalCategoryValueArr[questionValue.categoryId]) {
                    totalCategoryValueArr[questionValue.categoryId] = totalCategoryValueArr[questionValue.categoryId] + parseInt(questionValue.answer, 10);
                  } else {
                    totalCategoryValueArr[questionValue.categoryId] = parseInt(questionValue.answer, 10);
                  }
                }
            });
          }
        });

        var graphData = [];

        angular.forEach(categoryList, function(value, index) {
          var graphObj = {
            'value': '',
            'label': value.categoryName
          }
          if(value.categoryCount == '0') {
            graphObj.value = 0;
          } else {
            graphObj.value = Math.round(totalCategoryValueArr[value.categoryId]/(value.categoryCount));
          }
          graphData.push(graphObj);
        });


        var uniqueGraphData = [];

        angular.forEach(graphData, function(value, key) {
            var exists = false;
            angular.forEach(uniqueGraphData, function(val2, key) {
                if(angular.equals(value.label, val2.label)) {
                    exists = true
                };
            });
            if(exists == false) {
                uniqueGraphData.push(value);
            }
        });

        localStorage.setItem('graphData', JSON.stringify(uniqueGraphData));

        var totalgraphDataValue = 0;
        var totalCategoryCount = 0;
        angular.forEach(uniqueGraphData, function (value, index) {

            totalgraphDataValue += value.value;
            totalCategoryCount++;
        });

        $scope.myScore = Math.round(((totalgraphDataValue/totalCategoryCount)/5)*100);
        localStorage.setItem('score'+$scope.surveyId, $scope.myScore);

        angular.forEach(ans, function(value, index) {
          var remarks = $('#remarks-textarea'+index).val();
          if(remarks) {
           ans[index] = ans[index] + "&;" + remarks;
          }
        });

        if(type == '') {
          alert("Your score is: " + $scope.myScore + "%");

          var confirmSubmit = confirm("Do you want to submit your Survey?");
          if(confirmSubmit) {
            saveResult.save(ans, $scope.surveyId, 'completed');
            $scope.loading = true;
            setTimeout(function() {

              var networkState = '';
              if (navigator.connection == null) {
                 networkState ="unknown";
              }
              else{
                  networkState = navigator.connection.type;
              }    

              // if (networkState == "2g" || networkState == "3g" || networkState == "4g"|| networkState == "wifi" || networkState == "unknown") {
              // //if (networkState == "2g" || networkState == "3g" || networkState == "4g"|| networkState == "wifi") {

              // } else if(networkState == "none" || networkState == "unknown") {
              //     $scope.loading = false;
              //     alert('You dont have internet connection. Please click sync button to submit the survey.');
              // }

              updateAnswerOnServer(localStorage.getItem('userId'));
              setTimeout(function() {
                var data = JSON.parse(localStorage.getItem('answerObject'));
                      var submitSurveyUrl= "http://rocuat.tmf.co.in/Survey/route/submitanswer";
                      var networkState = '';
                      if (navigator.connection == null) {
                         networkState ="unknown";
                      }
                      else{
                          networkState = navigator.connection.type;
                      }    

                      //if (networkState == "2g" || networkState == "3g" || networkState == "4g"|| networkState == "wifi" || networkState == "unknown") {
                      if (networkState == "2g" || networkState == "3g" || networkState == "4g"|| networkState == "wifi") {
                          $http.post(submitSurveyUrl, data).
                          success(function (data) {
                            $scope.loading = false;
                              if(data.message == "Success") {
                                var surveyList = (data.SurveyId).split(',');
                                var uniqueSurveyList = [];
                                $.each(surveyList, function(i, el){
                                    if($.inArray(el, uniqueSurveyList) === -1) uniqueSurveyList.push(el);
                                });
                                for(var i = 0; i < uniqueSurveyList.length; i++) {
                                  updateSurveySyncStatus(uniqueSurveyList[i]);
                                }
                              } else if(data.message == "No Data to upload") {
                                alert('No data to sync.');
                              } 
                              else if(data.message == "Failure") {
                                alert('Sync unsuccessful. Please try again.');
                              }
                          });
                      }
                      else if(networkState == "none" || networkState == "unknown")
                      {
                          $scope.loading = false;
                          alert('You dont have internet connection. Please click sync button to submit the survey.');
                      }
                      $window.location.href = "#/reports";
              }, 5000);
              
            }, 2000);
          } else {
            saveResult.save(ans, $scope.surveyId, 'completed');
            setTimeout(function() {
              generateJson();
              setTimeout(function() {
                $route.reload();
              }, 1000);
            }, 1000);
          }
        } else {
          saveResult.save(ans, $scope.surveyId, 'completed');
          $window.location.href = "#/reports";
        }
        
      }, 500);
      
    }

    $scope.getToPreviousPage = function() {
      localStorage.setItem('HomeReloadStatus', 'true');
       localStorage.setItem('reloadCountValue', '');
      localStorage.setItem('reloadCountValueSurvey', '');
      $window.location.href = "#/home";
    };

    $scope.logout = function() {
      var confirmLogout = confirm("Are you sure you want to Logout?");
      if(confirmLogout) {
         localStorage.setItem('reloadCountValue', '');
        localStorage.setItem('reloadCountValueSurvey', '');
        $window.location.href = "#/login"
      }
    }

}]);

app.controller('reportsController', ['$scope', '$window', function ($scope, $window) {
    $scope.title="Reports";

     localStorage.setItem('reloadCountValue', '');
    localStorage.setItem('reloadCountValueSurvey', '');

    $scope.toggleReports = function($event) {
        event.preventDefault();

        $(event.target).tab('show');
    }

    $scope.getToPreviousPage = function() {
      localStorage.setItem('HomeReloadStatus', 'true');
      $window.location.href = "#/home";
    };

    var graphColors = ['#FF0000', '#F1F10F', '#0EA9EF', '#15EC15', '#FFA500', '#EC40D1', '#4047EC'];

    $scope.graphData = JSON.parse(localStorage.getItem('graphData'));

    var totalgraphDataValue = 0;
    var totalCategoryCount = 0;
    angular.forEach($scope.graphData, function (value, index) {
        totalgraphDataValue += value.value;
        totalCategoryCount++;
    });

    $scope.myScore = Math.round(((totalgraphDataValue/totalCategoryCount)/5)*100);

    angular.forEach($scope.graphData, function (value, index) {
        value.percentage = Math.round(((value.value)/totalgraphDataValue)*100);
        value.color = graphColors[index];
    });

    $scope.toggleDataDisplay = function(type) {
        var selectedType;
        if(type == 'stage') {
            selectedType = $scope.selectedStageType;
        } else {
            selectedType = $scope.selectedProductType;
        }
        if(selectedType == ('show-' + type + '-percentage')) {
            $('.reports-wrapper .show-' + type + '-count').hide();
            $('.reports-wrapper .show-' + type + '-percentage').show();
        } else {
            $('.reports-wrapper .show-' + type + '-percentage').hide();
            $('.reports-wrapper .show-' + type + '-count').show();
        }
    };

    
    $( document ).ready(function() {
        var ctx1 = new Chart(document.getElementById("chart-area1").getContext("2d")).PolarArea($scope.graphData);
    });

    $scope.logout = function() {
      var confirmLogout = confirm("Are you sure you want to Logout?");
      if(confirmLogout) {
         localStorage.setItem('reloadCountValue', '');
        localStorage.setItem('reloadCountValueSurvey', '');
        $window.location.href = "#/login"
      }
    }

}]);

app.controller('registerController', ['$scope', function ($scope) {
    $scope.title="Register";
}]);

app.controller('forgotPasswordController', ['$scope', function ($scope) {
    $scope.title="Forgot Password";
}]);

app.service('saveResult', function (getCurrentDate) {
    var answers = [];
    this.save = function (ans, surveyId, completed) {
        
        angular.forEach(ans, function (value, index) {
            var ansObject = {
              "questionId": index,
              "surveyId": surveyId,
              "answer": '',
              "answerDateTime": getCurrentDate.date(),
              "notApplicable": ''
            };
            if(value == true) {
              ansObject.notApplicable = '1';
            } else {
              ansObject.answer = value;
            }
            answers.push(ansObject);
        });
        updateAnswers(answers, completed); 
    }
});

app.service('getCurrentDate', function() {
  this.date = function() {
    var today = new Date();
    var dd = today.getDate();
    var mm = today.getMonth()+1; //January is 0!

    var yyyy = today.getFullYear();
    if(dd<10){
        dd='0'+dd
    } 
    if(mm<10){
        mm='0'+mm
    } 
    var today = dd+'/'+mm+'/'+yyyy;
    return today;
  }
});

app.service('progressStatus', function () {
    this.update = function (totalAnswerCount, totalquestionCount) {
      var progressStatus;
      progressStatus = Math.round((totalAnswerCount/totalquestionCount)*100);
      $('#survey-progress').css('width', progressStatus + '%').html(progressStatus + '%');
    }

    this.checkCompleted = function ($event, formNumber, refDiv) {
      var answersSubmitted = 0;
      var remarksSubmitted = 'true';
      if(refDiv) {
        refDiv.find('input:radio').each(function() {
          if($(this).is(':checked')) {
            answersSubmitted++;
            var remarksText = $(this).parents('.options-wrapper').next('.remarks-textbox-wrapper');
            if(remarksText.css('display') == 'block' && remarksSubmitted == 'true') {
              if(remarksText.children('.remarks-textbox').val() == '') {
                remarksSubmitted = 'false';
              }
            }
          }
        });

        refDiv.find('textarea.free-text').each(function() {
          if($(this).val() !== '') {
            answersSubmitted++;
          }
        });

        refDiv.find('.not-applicable-btn-wrapper input').each(function() {
          if($(this).prop('checked') == true) {
            answersSubmitted++;
          }
        });
      } else {
        $(event.target).parents('.tab-pane').find('input:radio').each(function() {
          if($(this).is(':checked')) {
            answersSubmitted++;
            var remarksText = $(this).parents('.options-wrapper').next('.remarks-textbox-wrapper');
            if(remarksText.css('display') == 'block' && remarksSubmitted == 'true') {
              if(remarksText.children('.remarks-textbox').val() == '') {
                remarksSubmitted = 'false';
              }
            }
          }
        });

        $(event.target).parents('.tab-pane').find('textarea.free-text').each(function() {
          if($(this).val() !== '') {
            answersSubmitted++;
          }
        });

        $(event.target).parents('.tab-pane').find('.not-applicable-btn-wrapper input').each(function() {
          if($(this).prop('checked') == true) {
            answersSubmitted++;
          }
        });
      }
      
      var formNo = formNumber-1;
      var questionCount = 0;
      $('#form' + formNo + ' .question-wrapper').each(function() {
        questionCount++;
      });

      if((answersSubmitted == 5 || answersSubmitted == questionCount) && remarksSubmitted == 'true') {
        $(".page-number-wrapper li:nth-child(" + formNo + ")").addClass('completed');
      } else {
        $(".page-number-wrapper li:nth-child(" + formNo + ")").addClass('partially-completed');
      }
    }
});

//loader directive
app.directive('loading', function () {
    return {
        restrict: 'E',
        replace:true,
        template: '<div class="loader-wrapper"><div class="loader">Loading...</div><div class="loader-cover"></div></div>',
        link: function (scope, element, attr) {
            scope.$watch('loading', function (val) {
                if (val)
                    $(element).show();
                else
                    $(element).hide();
            });
        }
    }
});

app.filter('changeStatus', function() {
    return function(surveyId) {

      var surveyData = JSON.parse(localStorage.getItem('surveyData'));
      var questionCount = 0;
      var answerCount = 0;

        angular.forEach(surveyData, function (value, index) {
          if(surveyId == value.surveyId) {
            angular.forEach(value.questionList, function (questionValue, questionIndex) {
              questionCount++;
              if(questionValue.answer != null && questionValue.answer != '') {
                answerCount++;
              }

              if(questionValue.notApplicable == '1') {
                answerCount++;
              }
            });
          }          
        });

        if((questionCount == answerCount) && questionCount != 0 && answerCount != 0) {
            return 'Completed';
          } else if(answerCount >= 1) {
            return 'In Progress';
          } else {
            return 'Pending';
          }
    }
});

app.filter('setScore', function() {
    return function(surveyId) {
      var score = localStorage.getItem('score'+surveyId);
      if(score) {
        return score;
      } else {
        return '0';
      }
    }
});

app.filter('setDay', function() {
    var originalDate, dateArr = [];
    return function(number) {
        originalDate = number;
        dateArr = number.split('/');
        return dateArr[0];
    }
});

app.filter('setSuper', function() {
    var originalDate, dateSuper, dateArr = [];
    return function(number) {
        originalDate = number;
        dateArr = originalDate.split('/');
        if(dateArr[0] === '01' || dateArr[0] === '1') {
            dateSuper = 'st';
          } else if(dateArr[0] === '01' || dateArr[0] === '1') {
            dateSuper = 'nd';
          } else if (dateArr[0] === '01' || dateArr[0] === '1') {
            dateSuper = 'rd';
          } else {
            dateSuper = 'th';
          }
        return dateSuper;
    }
});

app.filter('setMonthYear', function() {
    var originalDate, dateArr = [], month;
    var monthNames = ["January", "February", "March", "April", "May", "June",
     "July", "August", "September", "October", "November", "December"
    ];
    return function(number) {
        originalDate = number;
        dateArr = number.split('/');
        month = monthNames[parseInt(dateArr[1], 10)];
        //return month + ' ' + dateArr[2];
        return month;
    }
});

document.addEventListener("backbutton", function(e){
    e.stopImmediatePropagation();
    e.preventDefault();
    var r = confirm("Are you sure you want to exit?");
    if (r == true) {
       localStorage.setItem('reloadCountValue', '');
      localStorage.setItem('reloadCountValueSurvey', '');
        navigator.app.exitApp();
    }
}, false);
