/*var app = angular.module('myApp', []);
app.controller('myCtrl', function myCtrl($scope,$http) {
    $http.get('file:///C:/Users/1264295/Desktop/Lead%20creation%20code/DB/New%20folder/home.html').success(function(data){
      
     $scope.author=data;
    });

});*/

var db = openDatabase('FlexliSalesDemo1.1', '1.0', 'Test DB', 5 * 1024 * 1024);



function createTable(){
    db.transaction(function (tx) {
        tx.executeSql('CREATE TABLE IF NOT Exists Login (id INTEGER PRIMARY KEY, Username, Password, Token)');
        tx.executeSql('CREATE TABLE IF NOT EXISTS Userdata (id INTEGER PRIMARY KEY, LeadType, Product, Channel, FinanaceType, FinanaceCategory, FName, LName, MobileNo,Address1, Address2, Address3, City, Meetinglocation,MeetingTime,CreationDate,LeadId,Segment,AssetValue,LoanAmount,Tenure,IRR,Sync_Status,OpportunityId,Favourite,DateTime, MobilePK, UserId, Remarks)');
        tx.executeSql('CREATE TABLE IF NOT EXISTS Pocketguide (id INTEGER PRIMARY KEY, schemeName, product, irr, docCharges, validUpTo)');   
    });
}

function dropUserTable(){
    localStorage.removeItem('finalobject');
    db.transaction(function (tx) {
        tx.executeSql('DROP TABLE Userdata');
    });
}

function dropLoginTable(){
    localStorage.removeItem('finalobject');
    db.transaction(function (tx) {
        tx.executeSql('DROP TABLE Login');
    });
}

function insertIntoLogin(username,password,token){
    createTable();
    var userName2=username;
    var add=0;
    db.transaction(function(tx){
        tx.executeSql('SELECT * FROM Login', [], function (tx, results) {
            var length= results.rows.length, i;
            //console.log(length);
            if(length==0){
                tx.executeSql('INSERT INTO Login(Username,Password,Token) VALUES (?,?,?)',[username,password,token]);
            }
            else{
                for (i = 0;i< length; i++){
                    if(userName2!= results.rows.item(i).Username){
                        add=1;
                    //                        tx.executeSql('INSERT INTO Login(Username,Password,Token) VALUES (?,?,?)',[username,password,token]);
                    }
                    else{
                        add=0;
                    }
                }
                if (add==1){
                    tx.executeSql('INSERT INTO Login(Username,Password,Token) VALUES (?,?,?)',[username,password,token]);
                }
                else if(add=0){
                    return true;
                }
            }
        });
    },null);
}


/*function insertIntoLead(FName,LName,MobileNo,Address1,Address2,Address3,City,Meetinglocation,MeetingTime,CreationDate,LeadType,Product,Channel,FinanaceType,FinanaceCategory,LeadId,Segment,AssetValue,LoanAmount,Tenure,IRR,Sync_Status,OpportunityId,Favourite,DateTime){
    db.transaction(function(tx){
      tx.executeSql('INSERT INTO Userdata (FName, LName, MobileNo, Address1, Address2, Address3, City, Meetinglocation, MeetingTime,CreationDate,LeadType,Product,Channel,FinanaceType,FinanaceCategory,LeadId,Segment,AssetValue,LoanAmount,Tenure,IRR,Sync_Status,OpportunityId,Favourite,DateTime) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)',[FName,LName,MobileNo,Address1,Address2,Address3,City,Meetinglocation,MeetingTime,CreationDate,LeadType,Product,Channel,FinanaceType,FinanaceCategory,LeadId,Segment,AssetValue,LoanAmount,Tenure,IRR,Sync_Status,OpportunityId,Favourite,DateTime]);
    });
}*/

function insertOpportunitydata(data, mbpk){
    db.transaction(function(tx){
        var i = 0;
        tx.executeSql("UPDATE Userdata SET AssetValue=?, IRR=?, LoanAmount=?, Segment=?, Tenure=?, Sync_Status=? WHERE MobilePK = ?",
            [data.Opportunity.AssetValue,
            data.Opportunity.IRR,
            data.Opportunity.LoanAmount,
            data.Opportunity.Segment,
            data.Opportunity.Tenure,
            data.MetaData.Sync_Status,
            mbpk]
            );
    });
}


function insertRescheduleMeetingdata(data, mbpk){
    db.transaction(function(tx){
        var i = 0;
        tx.executeSql("UPDATE Userdata SET Meetinglocation=?, MeetingTime=?, Remarks=?, Sync_Status=? WHERE MobilePK = ?",
            [data.meeting.Meetinglocation,
            data.meeting.MeetingTime,
            data.meeting.Remarks,
            'U',
            mbpk]
            );
    });
}

function insertIntoUserdata(data, mbpk, directOpp){

    createTable();
    if(mbpk) {
        db.transaction(function(tx){
            var i = 0;
            tx.executeSql("UPDATE Userdata SET LeadType=?, Product=?, Channel=?, FinanaceType=?, FinanaceCategory=?, FName=?, LName=?, MobileNo=?,Address1=?, Address2=?, Address3=?, City=?, Meetinglocation=?,MeetingTime=?,Sync_Status=? WHERE MobilePK = ?",[data.TransactionData[i].Lead.LeadType,
                data.TransactionData[i].Lead.Product,
                data.TransactionData[i].Lead.Channel,
                data.TransactionData[i].Lead.FinanaceType,
                data.TransactionData[i].Lead.FinanaceCategory,
                data.TransactionData[i].Lead.FName,
                data.TransactionData[i].Lead.LName,
                data.TransactionData[i].Lead.MobileNo,
                data.TransactionData[i].Lead.Addreess1,
                data.TransactionData[i].Lead.Addreess2,
                data.TransactionData[i].Lead.Addreess3,
                data.TransactionData[i].Lead.City,
                data.TransactionData[i].Lead.Meetinglocation,
                data.TransactionData[i].Lead.MeetingTime,
                data.TransactionData[i].MetaData.Sync_Status,
                data.TransactionData[i].MetaData.Mobile_PK]
                );
        });
    } else {
        db.transaction(function(tx){
            for(var i = 0; i < data.TransactionData.length; ++i){
                tx.executeSql('INSERT INTO Userdata (LeadType, Product, Channel, FinanaceType, FinanaceCategory, FName, LName, MobileNo,Address1, Address2, Address3, City, Meetinglocation,MeetingTime,CreationDate,LeadId,Segment,AssetValue,LoanAmount,Tenure,IRR,Sync_Status,OpportunityId,Favourite,DateTime, MobilePK, UserId, Remarks) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)',[data.TransactionData[i].Lead.LeadType, data.TransactionData[i].Lead.Product,data.TransactionData

                    [i].Lead.Channel,data.TransactionData[i].Lead.FinanaceType,data.TransactionData[i].Lead.FinanaceCategory,data.TransactionData

                    [i].Lead.FName,data.TransactionData[i].Lead.LName,data.TransactionData[i].Lead.MobileNo,data.TransactionData

                    [i].Lead.Addreess1,data.TransactionData[i].Lead.Addreess2,data.TransactionData[i].Lead.Addreess3,data.TransactionData

                    [i].Lead.City,data.TransactionData[i].Lead.Meetinglocation,data.TransactionData[i].Lead.MeetingTime,data.TransactionData

                    [i].Lead.CreationDate,data.TransactionData[i].Opportunity.LeadId,data.TransactionData

                    [i].Opportunity.Segment,data.TransactionData[i].Opportunity.AssetValue,data.TransactionData

                    [i].Opportunity.LoanAmount,data.TransactionData[i].Opportunity.Tenure,data.TransactionData

                    [i].Opportunity.IRR,data.TransactionData[i].MetaData.Sync_Status,data.TransactionData

                    [i].MetaData.OpportunityId,"","",data.TransactionData

                    [i].MetaData.Mobile_PK,data.TransactionData[i].MetaData.UserId,""])
            }

        }, function(tx,error){
            //console.log(error)
            });
    }

}

function displayDataOnGrid(userId){
    var finalobject={};
    var TransactionData=[];
    finalobject.TransactionData=[];
    db.transaction(function(tx){
        tx.executeSql('SELECT * FROM Userdata where UserId=?', [userId], function (tx, results) {
            localStorage.removeItem('finalobject');
            var len = results.rows.length, i;
            for (i = 0; i < len; i++){
                            
                var lead ={
                    "FName" : results.rows.item(i).FName,
                    "LName" :results.rows.item(i).LName,
                    "MobileNo" :results.rows.item(i).MobileNo,
                    "Address1":results.rows.item(i).Address1,
                    "Address2":results.rows.item(i).Address2,
                    "Address3":results.rows.item(i).Address3,
                    "City":results.rows.item(i).City,
                    "Meetinglocation":results.rows.item(i).Meetinglocation,
                    "MeetingTime":results.rows.item(i).MeetingTime,
                    "LeadType":results.rows.item(i).LeadType,
                    "Product":results.rows.item(i).Product,
                    "Channel":results.rows.item(i).Channel,
                    "FinanaceType":results.rows.item(i).FinanaceType,
                    "FinanaceCategory":results.rows.item(i).FinanaceCategory,
                    "CreationDate": results.rows.item(i).CreationDate,
                    "Remarks":  results.rows.item(i).Remarks
                };
                var oppurtinity={
                    "LeadId":results.rows.item(i).LeadId,
                    "Segment":results.rows.item(i).Segment,
                    "AssetValue":results.rows.item(i).AssetValue,
                    "LoanAmount":results.rows.item(i).LoanAmount,
                    "Tenure":results.rows.item(i).Tenure,
                    "IRR":results.rows.item(i).IRR
                };
                var metadata={
                    "UserId":results.rows.item(i).UserId,
                    "Mobile_PK":results.rows.item(i).MobilePK,
                    "LeadId":results.rows.item(i).LeadId,
                    "OpportunityId":results.rows.item(i).OpportunityId,
                    "Sync_Status":results.rows.item(i).Sync_Status,
                    "Token_Id":"1256xyfyufu"
                };
                var values={
                    "Lead":lead,
                    "Opportunity":oppurtinity,
                    "MetaData":metadata
                };
                finalobject.TransactionData.push(values);

            }
            //console.log(finalobject);
            localStorage.setItem('finalobject', JSON.stringify(finalobject));
        }, null);
    });
//return finalobject;
}

function updateFavourite(favouriteValue,whereid){
    db.transaction(function(tx){
        tx.executeSql('UPDATE Userdata SET Favourite = ? WHERE id = ?',[favouriteValue,whereid]);
    });
}

function updateLeadTable(Meetinglocation,MeetingDate,MeetingTime,Remark){
    db.transaction(function(tx){
        tx.executeSql('UPDATE Userdata SET Meetinglocation = ? MeetingDate = ? MeetingTime = ? Remark = ? WHERE id = ?',[Meetinglocation,MeetingDate,MeetingTime,Remark,id]);
    });
}

function GenerateJsonForSync(userid){
    var finalobject1={};
   
    var TransactionData=[];
    finalobject1.TransactionData=TransactionData;
    db.transaction(function(tx){
        tx.executeSql('SELECT * FROM Userdata WHERE Sync_Status = ? OR Sync_Status = ? OR  Sync_Status = ? AND UserId=?', ['N','O','U', userid], function (tx, results) {
            var len = results.rows.length, i;
            for (i = 0; i < len; i++){
                var lead ={
                    "FName" : results.rows.item(i).FName,
                    "LName" :results.rows.item(i).LName,
                    "MobileNo" :results.rows.item(i).MobileNo,
                    "Address1":results.rows.item(i).Address1,
                    "Address2":results.rows.item(i).Address2,
                    "Address3":results.rows.item(i).Address3,
                    "City":results.rows.item(i).City,
                    "Meetinglocation":results.rows.item(i).Meetinglocation,
                    "MeetingTime":results.rows.item(i).MeetingTime,
                    "LeadType":results.rows.item(i).LeadType,
                    "Product":results.rows.item(i).Product,
                    "Channel":results.rows.item(i).Channel,
                    "FinanaceType":results.rows.item(i).FinanaceType,
                    "FinanaceCategory":results.rows.item(i).FinanaceCategory,
                    "CreationDate": results.rows.item(i).CreationDate
                };
                var oppurtinity={
                    "LeadId":results.rows.item(i).LeadId,
                    "Segment":results.rows.item(i).Segment,
                    "AssetValue":results.rows.item(i).AssetValue,
                    "LoanAmount":results.rows.item(i).LoanAmount,
                    "Tenure":results.rows.item(i).Tenure,
                    "IRR":results.rows.item(i).IRR
                };
                var metadata={
                    "UserId":results.rows.item(i).UserId,
                    "Mobile_PK":results.rows.item(i).MobilePK,
                    "LeadId":results.rows.item(i).LeadId,
                    "OpportunityId":results.rows.item(i).OpportunityId,
                    "Sync_Status":results.rows.item(i).Sync_Status,
                    "Token_Id":"1256xyfyufu"
                };
                var values={
                    "Lead":lead,
                    "Opportunity":oppurtinity,
                    "MetaData":metadata
                };
                var allocObject={
                    // "UserId": results.rows.item(i).UserId,
                    "UserId": "99010969",
                    "Token_Id": "123213sdjjfksjf"
                };
                finalobject1.TransactionData.push(values);
            //console.log(results.rows);
            //console.log(finalobject1.TransactionData[0].MetaData.Mobile_PK);
            }
            localStorage.setItem('finalobject1', JSON.stringify(finalobject1));
            localStorage.setItem('allocObject', JSON.stringify(allocObject));
        //console.log("db finalobj"+localStorage.getItem('finalobject1'));
        //console.log("alloc data : "+localStorage.getItem('allocObject'));
        }, null);
    });
    return finalobject1;
}
//WHERE Sync_Status LIKE = ? '

function checkEntryStatusOnServer(userid){
    var primaryObject={};
    var RSyncData=[];
    primaryObject.RSyncData=RSyncData;
    
    db.transaction(function(tx){
        tx.executeSql('SELECT * FROM Userdata WHERE Sync_Status = ? OR Sync_Status = ? AND UserId = ?', ['L','OR', userid],function (tx, results) {
            var len = results.rows.length, i;
           for (i = 0; i < len; i++){
                console.log(userid);
                var values={
                    "UserId" : results.rows.item(i).UserId,
                    "Mobile_PK" : results.rows.item(i).MobilePK,
                    "LeadId" :results.rows.item(i).LeadId,
                    "OpportunityId":results.rows.item(i).OpportunityId,
                    "Sync_Status":results.rows.item(i).Sync_Status,
                    //"Sync_Status":"N",
                    "Token_Id" : "sdfd"
                };
                console.log("userid Value :" +(values.UserId));
                primaryObject.RSyncData.push(values);
            }
           //console.log("userid Value :" + JSON.stringify(values.UserId));
            localStorage.setItem('primaryObject', JSON.stringify(primaryObject));
        //console.log("RSync Input : "+localStorage.getItem('primaryObject'));
        },null);

    });
}

function updateEntryStatus(SyncDataOutput, userid){
    // var RSyncDataOutput=(localStorage.getItem('RSyncDataOutput'));
    // console.log("Received at db: "+RSyncDataOutput.RSyncData);
    db.transaction(function(tx){
        for(var i = 0; i < SyncDataOutput.SyncOutput.length; i++){
            tx.executeSql("UPDATE Userdata SET LeadId=?, OpportunityId=?, Sync_Status=? WHERE MobilePK = ? AND UserId=?",[SyncDataOutput.SyncOutput[i].LeadId,SyncDataOutput.SyncOutput[i].OpportunityId,SyncDataOutput.SyncOutput[i].Sync_Status,SyncDataOutput.SyncOutput[i].Mobile_PK, userid]);
        }
    });
}



function countLead(){
    
    db.transaction(function(tx){
        tx.executeSql('SELECT * FROM Userdata WHERE Sync_Status =?', ['L'], function (tx, results) {
            var len = results.rows.length, i;
            var output = document.getElementById('dispLead');
            output.innerHTML = len;
        }, null);
            
    });
}

function countOpp(){
    
    db.transaction(function(tx){
        tx.executeSql('SELECT * FROM Userdata WHERE Sync_Status =?', ['o'], function (tx, results) {
            var len = results.rows.length, i;
            var output = document.getElementById('dispOpp');
            output.innerHTML = len;
        }, null);
            
    });
}

function countTotal(){
    
    db.transaction(function(tx){
        tx.executeSql('SELECT * FROM Userdata', [], function (tx, results) {
            var len = results.rows.length, i;
            var output = document.getElementById('dispTotal');
            output.innerHTML = len;
        }, null);
            
    });
}
//
//var allocatedData={
//    "AllocationList": [
//    {
//        "Lead": {
//            "LeadType": "Individual",
//            "Product": "Nano",
//            "Channel": "New",
//            "FinanaceType": "New",
//            "FinanaceCategory": "NewFinance",
//            "FName": "Sumeet",
//            "LName": "Kapoor",
//            "MobileNo": "9854410101",
//            "Address1": "A101",
//            "Address2": "Hello Apartments",
//            "Address3": "Mumbai",
//            "City": "Mumbai",
//            "Meetinglocation": "Vivivanna Mall",
//            "MeetingTime": "13/04/2016 5PM"
//        },
//        "Opportunity": {
//            "LeadId": "144071",
//            "Segment": "Retail",
//            "AssetValue": "65900",
//            "LoanAmount": "74120",
//            "Tenure": "5",
//            "IRR": "14"
//        },
//        "MetaData": {
//            "UserId": "99020999",
//            "Mobile_PK": "",
//            "LeadId": "144071",
//            "OpportunityId": "",
//            "Sync_Status": "L",
//            "Token_Id": "1256xyfyufu"
//        }
//    },
//    {
//        "Lead": {
//            "LeadType": "Organization",
//            "Product": "Safari",
//            "Channel": "New",
//            "FinanaceType": "New",
//            "FinanaceCategory": "NewFin",
//            "FName": "Harpreet",
//            "LName": "Singh",
//            "MobileNo": "9871100115",
//            "Address1": "C908",
//            "Address2": "Sunshine Building",
//            "Address3": "Sector 5",
//            "City": "Vashi",
//            "Meetinglocation": "Korum Mall",
//            "MeetingTime": "15/04/2016 1PM"
//        },
//        "Opportunity": {
//            "LeadId": "144080",
//            "Segment": "Retail",
//            "AssetValue": "984500",
//            "LoanAmount": "564120",
//            "Tenure": "9",
//            "IRR": "7"
//        },
//        "MetaData": {
//            "UserId": "99020999",
//            "Mobile_PK": "",
//            "LeadId": "144080",
//            "OpportunityId": "",
//            "Sync_Status": "L",
//            "Token_Id": "1256xyfyufu"
//        }
//    }
//    ]
//}
//

function insertAllocatedData(allocatedData){

    db.transaction(function(tx){
        for(var i = 0; i < allocatedData.AllocationList.length; ++i){
            var mobile_no = parseInt(allocatedData.AllocationList[i].Lead.MobileNo, 10);
            if(((allocatedData.AllocationList[i].Opportunity.LeadId)!="") &&(allocatedData.AllocationList[i].MetaData.Mobile_PK)!=""){
                tx.executeSql('INSERT INTO Userdata (LeadType, Product, Channel, FinanaceType, FinanaceCategory, FName, LName, MobileNo,Address1, Address2, Address3, City, Meetinglocation,MeetingTime,CreationDate,LeadId,Segment,AssetValue,LoanAmount,Tenure,IRR,Sync_Status,OpportunityId,Favourite,DateTime, MobilePK, UserId, Remarks) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)',[allocatedData.AllocationList[i].Lead.LeadType, allocatedData.AllocationList[i].Lead.Product,allocatedData.AllocationList

                    [i].Lead.Channel,allocatedData.AllocationList[i].Lead.FinanaceType,allocatedData.AllocationList[i].Lead.FinanaceCategory,allocatedData.AllocationList

                    [i].Lead.FName,allocatedData.AllocationList[i].Lead.LName,mobile_no,allocatedData.AllocationList

                    [i].Lead.Address1,allocatedData.AllocationList[i].Lead.Address2,allocatedData.AllocationList[i].Lead.Address3,allocatedData.AllocationList

                    [i].Lead.City,allocatedData.AllocationList[i].Lead.Meetinglocation,allocatedData.AllocationList[i].Lead.MeetingTime,allocatedData.AllocationList

                    [i].Lead.CreationDate,allocatedData.AllocationList[i].Opportunity.LeadId,allocatedData.AllocationList

                    [i].Opportunity.Segment,allocatedData.AllocationList[i].Opportunity.AssetValue,allocatedData.AllocationList

                    [i].Opportunity.LoanAmount,allocatedData.AllocationList[i].Opportunity.Tenure,allocatedData.AllocationList

                    [i].Opportunity.IRR,allocatedData.AllocationList[i].MetaData.Sync_Status,allocatedData.AllocationList

                    [i].MetaData.OpportunityId,"","",allocatedData.AllocationList

                    [i].MetaData.Mobile_PK,allocatedData.AllocationList[i].MetaData.UserId,""])
            //console.log("checking db "+allocatedData.AllocationList[i].MetaData.Mobile_PK);
            }
        }


    }, function(tx,error){
        //console.log(error)
        });
}


function insertIntoPocketguide(data){
    createTable();
    db.transaction(function(tx){
        for(var i=0;i<data.pocketGuideData.length;i++){
            tx.executeSql('INSERT INTO Pocketguide (schemeName,product,irr,docCharges,validUpTo) VALUES(?,?,?,?,?)',[data.pocketGuideData[i].schemeName,data.pocketGuideData[i].product,data.pocketGuideData[i].irr,data.pocketGuideData[i].docCharges,data.pocketGuideData[i].validUpTo]);
        }
        setTimeout(function(){
            window.location.reload();
        }, 100);
    });
}

function deleteFromPocket(){
    db.transaction(function (tx) {
        localStorage.removeItem('pocketData');
        tx.executeSql('DROP TABLE Pocketguide');
    });
}

function displayDataPocketGuide(){
    var sendobject={};
    var senddata=[];
    sendobject.senddata=[];
    db.transaction(function(tx){
        tx.executeSql('SELECT * FROM Pocketguide', [], function (tx, results) {
            var len = results.rows.length, i;
            for (i = 0; i < len; i++){
                var data={
                    "schemeName":results.rows.item(i).schemeName,
                    "product":results.rows.item(i).product,
                    "irr":results.rows.item(i).irr,
                    "docCharges":results.rows.item(i).docCharges,
                    "validUpTo":results.rows.item(i).validUpTo
                }
                sendobject.senddata.push(data);
            }
            localStorage.setItem("pocketData",JSON.stringify(sendobject));
        },null);

    });
}
