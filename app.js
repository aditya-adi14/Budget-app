var budgetController = (function(){
    var Expnes = function(id, description, value){
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };
    Expnes.prototype.calPercentage = function(totalIcome){
        if(totalIcome > 0){
      this.percentage =   Math.round((this.value/totalIcome)*100);
        } else {
            this.percentage = -1;
        }
    };
    Expnes.prototype.getPercentage = function(){
      return this.percentage;  
    };
    var Income = function(id, description, value){
        this.id = id;
        this.description = description;
        this.value = value;
    };
    var calculateTotal = function(type){
        var sum = 0;
        data.allItems[type].forEach(function(curr){
            sum = sum + curr.value;
        });
        data.totals[type] = sum;
        
        
    };
    
    var data = {
        allItems: {
            exp : [],
            inc : []
        },
        totals: {
            exp : 0,
            inc : 0
        },
        budget : 0,
        percentage : -1
        
        
    };
    
    return {
        addItem: function(type, des, val){
            var newIteam,ID=0;
            
            if(data.allItems[type].length > 0){
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            } else {
                ID = 0;
            }
            
            if(type === "exp"){
                newIteam = new Expnes(ID, des, val);
            } else if(type === "inc"){
                newIteam = new Income(ID, des, val);
            }
            data.allItems[type].push(newIteam);
            
                    return newIteam;

        },
        deleteItem : function(type, id){
          var ids, index;
            ids = data.allItems[type].map(function(current){
                return current.id;
            });
            index = ids.indexOf(id);
            if(index !== -1){
                data.allItems[type].splice(index, 1);
            }
        },
        calculateBudget : function(){
            // calculate total incomes and expenses
            calculateTotal("exp");
            calculateTotal("inc");
            // calculate the budget : income - expenses
            data.budget = data.totals.inc - data.totals.exp;
            // calculate the percentage of the income we spent
            if (data.totals.inc > 0) {
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            } else {
                data.percentage = -1;
            }
        },
        calculatePercentage : function(){
            data.allItems.exp.forEach(function(cur){cur.calPercentage(data.totals.inc);
                                      } );
                                       
        },
        getPercentage : function(){
          var allPer = data.allItems.exp.map(function(cur){
              return cur.getPercentage();
          })  
          return allPer;
        },
        getBudget : function(){
          return {
              budget : data.budget,
              totalInc: data.totals.inc,
              totalExp : data.totals.exp,
              percentage : data.percentage
          };  
        },
        testing : function(){
            console.log(data);
        }
        
       };
    
    
    
    
})();



var UIcontroller = (function(){
   var DOMstrings = {
        inputType : ".add__type",
            inputDescription : ".add__description",
        inputValue : ".add__value",
       inputBtn : ".add__btn",
       incomeContainer : '.income__list',
       expenseContainer : '.expenses__list',
       budgetLabel : ".budget__value",
       incomeLabel : ".budget__income--value",
       expensesLabel : ".budget__expenses--value",
       percentageLabel: ".budget__expenses--percentage",
       container : ".container",
       expensesPercentage : ".item__percentage",
       budgetTitle : ".budget__title--month"
       
    } 
   var formatNumber = function(num, type){
     var numSplit, int, dec, sign;
       num = Math.abs(num);
       num = num.toFixed(2);
       numSplit = num.split(".");
       int = numSplit[0];
       
       if(int.length > 3){
           int = int.substr(0, int.length-3) + ","+ int.substr(int.length-3, 3);
       }
       
       
       
       dec = numSplit[1];
       
       type === "exp" ? sign = '-': sign = "+";
       
       return sign + " "+int + "."+dec;
   };
              var nodeListForEach = function(list, callback){
                for(var i =0 ; i<list.length;i++){
                    callback(list[i],i);
                }
            };
    
    return {
        getInputs: function(){
            return {
                 type : document.querySelector(".add__type").value, // inc or exp
                 description : document.querySelector(".add__description").value,
                 value : parseFloat(document.querySelector(".add__value").value)
            };
       },
        addListItem : function(obj, type){
            // creat HTML string with placeholder text
            var html,newHtml,element;
            if(type === 'inc'){
                element = DOMstrings.incomeContainer;
                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button>        </div></div></div>';
            } else if(type === 'exp'){
                element = DOMstrings.expenseContainer;
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }
            // replace the pirticular text with actual text
            newHtml = html.replace("%id%", obj.id);
            newHtml = newHtml.replace("%description%", obj.description);
            newHtml = newHtml.replace("%value%", formatNumber(obj.value, type));
            // insert the html into the DOM
            
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
            
        
        },
        removingItem : function(selectorID){
          var el = document.getElementById(selectorID);
            el.parentNode.removeChild(el);
        },
        clearFields: function(){
            var fields, fieldsArr;
            fields = document.querySelectorAll(DOMstrings.inputDescription + ","+DOMstrings.inputValue);
            
            fieldsArr = Array.prototype.slice.call(fields);
            
            fieldsArr.forEach(function(current, index, array){
                current.value = ""; 
            });
            fieldsArr[0].focus();
        },
        displayBudget : function(obj){
            var type;
            obj.budget > 0 ? type = "inc" : type = "exp";
            document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget, type);
            document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalInc,"inc");
            document.querySelector(DOMstrings.expensesLabel).textContent = formatNumber(obj.totalExp, "exp");
            if(obj.totalExp > 0){
                document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + "%";
                } else {
                    document.querySelector(DOMstrings.percentageLabel).textContent = "--";
                }
        },
        displayMonth : function(){
          var month, now, months, year;
            months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];          
            now = new Date();
            month = now.getMonth();
            year = now.getFullYear();
            document.querySelector(DOMstrings.budgetTitle).textContent = months[month]+" "+year;
        },
        displayPercentages : function(percentages){
            var fields = document.querySelectorAll(DOMstrings.expensesPercentage);
            
  
            nodeListForEach(fields, function(current, index){
                if(percentages[index]>0){
                    current.textContent = percentages[index] + "%";
                } else {
                    current.textContent = '--';
                }
            });
        },
        changeType : function(){
          var fields = document.querySelectorAll(
           DOMstrings.inputType + ","+
            DOMstrings.inputDescription+","+
              DOMstrings.inputValue
          );
            nodeListForEach(fields, function(cur){
                cur.classList.toggle("red-focus");
            });
            document.querySelector(DOMstrings.inputBtn).classList.toggle("red");
        },
        getDOMstrings: function(){
            return DOMstrings;
        }
    };
    
    
})();


var Controller = (function (budgetctrl,UIctrl){
    var initComponents = function(){
         var DOM = UIctrl.getDOMstrings();
        document.querySelector(DOM.inputBtn).addEventListener("click", eventListeners);
    
    document.addEventListener("keypress", function(event){
        if(event.keyCode === 13 ){
            eventListeners();
        } 
    });
        document.querySelector(DOM.container).addEventListener("click",ctrlDeleteIteam);
        
        document.querySelector(DOM.inputType).addEventListener("change", UIctrl.changeType);
    };
    var updateBudget = function(){
        // 1. calculate the budget
        budgetctrl.calculateBudget();
        //2. return the budget
        var budget = budgetctrl.getBudget();
        //3. display the budget in UI
        UIctrl.displayBudget(budget);
    };
    var updatePercentage = function(){
      // 1. Calculate the percentage
        budgetctrl.calculatePercentage();
        // 2. read the percentage from the budget controller
        var percentage = budgetctrl.getPercentage();
        // 3. update the ui with the updated percentage
        UIctrl.displayPercentages( percentage);
    };
    
   
    var eventListeners = function(){
         //1 get the values from the input fields
        var input = UIctrl.getInputs();
        if(input.description !== "" && !isNaN(input.value) && input.value>0){
        
        // 2. Add the item to the budget controller
        var newItem = budgetctrl.addItem(input.type, input.description, input.value);
        // 3. Add the item to the UI
        UIctrl.addListItem(newItem, input.type);
        // 4. Clear the fields
        UIctrl.clearFields();
        // 5. Calculate and update budget
        updateBudget();
            // 6. update percentage
            updatePercentage();
 
        }
       
    };
    
    var ctrlDeleteIteam = function(event){
        var itemID, type,ID,splitID;
        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
        
        if(itemID){
            splitID = itemID.split("-");
            type = splitID[0];
            ID = parseInt(splitID[1]);
        }
        // 1. delete the item from the data structure
        budgetctrl.deleteItem(type, ID);
        // 2. delete the item from the UI
        UIctrl.removingItem(itemID);
        // 3. Update and show the budget
        updateBudget();
        // 4. update the percentage
        updatePercentage();
    };
    
    return {
        init: function(){
            console.log("application started");
            UIctrl.displayMonth();
        UIctrl.displayBudget({
              budget : 0,
              totalInc: 0,
              totalExp : 0,
              percentage : -1
          });
            
            initComponents();
        }
    }
    
    
})(budgetController,UIcontroller);

Controller.init();