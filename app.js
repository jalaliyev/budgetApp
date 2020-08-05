//Budget controller
var budgetController = (function () {
  var Expense = function (id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
    this.percentage = -1;
  };

  Expense.prototype.calcPerc = function (totalInc) {
    if (totalInc > 0) {
      this.percentage = Math.round((this.value / totalInc) * 100);
    } else {
      this.percentage = -1;
    }
  };

  Expense.prototype.getPercentage = function () {
    return this.percentage;
  };

  var Income = function (id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
  };

  var calculateTotal = function (type) {
    var sum = 0;
    data.allItems[type].forEach(function (cur) {
      sum += cur.value;
    });
    data.totals[type] = sum;
  };

  var data = {
    allItems: {
      exp: [],
      inc: [],
    },
    totals: {
      exp: 0,
      inc: 0,
    },
    budget: 0,
    percentage: -1,
  };

  return {
    addItem: function (type, des, val) {
      var newItem, ID;
      //Create new ID
      if (data.allItems[type].length > 0) {
        ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
      } else {
        ID = 0;
      }

      //Create new item based on 'inc' or 'exp' type
      if (type === "exp") {
        newItem = new Expense(ID, des, val);
      } else if (type === "inc") {
        newItem = new Income(ID, des, val);
      }

      //push it into our data structure
      data.allItems[type].push(newItem);

      //return the new element
      return newItem;
    },

    deleteItem: function (type, id) {
      var ids, index;
      //data.allItems[type][id];
      ids = data.allItems[type].map(function (current) {
        return current.id;
      });

      index = ids.indexOf(id);

      if (index !== -1) {
        data.allItems[type].splice(index, 1);
      }
    },

    calculateBudget: function () {
      //calculate total income and expenses
      calculateTotal("exp");
      calculateTotal("inc");

      //calculate the budget: income - expenses
      data.budget = data.totals.inc - data.totals.exp;

      //calculate the percentage of income we spent
      if (data.totals.exp > 0) {
        data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
      } else {
        data.percentage = -1;
      }
    },
    //calculate the percentage for each item expenses
    calculatePerc: function () {
      data.allItems.exp.forEach(function (cur) {
        cur.calcPerc(data.totals.inc);
      });
    },

    getPercentages: function () {
      var allPerc = data.allItems.exp.map(function (cur) {
        return cur.getPercentage();
      });
      return allPerc;
    },

    getBudget: function () {
      return {
        budget: data.budget,
        totalInc: data.totals.inc,
        totalExp: data.totals.exp,
        percentage: data.percentage,
        eachPerc: data.eachPerc,
      };
    },

    testing: function () {
      console.log(data);
    },
  };
})();

//UI controller
var UIController = (function () {
  var stringsDOM = {
    inputType: ".add__type",
    inputDescription: ".add__description",
    inputValue: ".add__value",
    inputBtn: ".add__btn",
    incomeCont: ".income__list",
    expensesCont: ".expenses__list",
    budgetLabel: ".budget__value",
    incomeLabel: ".budget__income--value",
    expensesLabel: ".budget__expenses--value",
    percentageLabel: ".budget__expenses--percentage",
    itempercLabel: ".item__percentage",
    container: ".container",
    expensesPercLabel: ".item__percentage",
    dateLabel: ".budget__title--month",
  };

  var formatNumber = function (num, type) {
    var numSplit, dec;
    /*
    + or - before number
    exactly 2 decimal points
    comma separating the thousands
    2310.4367 -> +2,310.44
    2000 (ex) -> - 2,000.00
    */
    num = Math.abs(num);
    num = num.toFixed(2);

    numSplit = num.split(".");

    int = numSplit[0];
    if (int.length > 3) {
      int = int.substr(0, int.length - 3) + "," + int.substr(int.length - 3, 3); // input 23127, output 2,3127
    }
    dec = numSplit[1];

    return (type === "exp" ? "-" : "+" + " ") + int + "." + dec;
  };

  var nodeListForEach = function (list, callback) {
    for (var i = 0; i < list.length; i++) {
      callback(list[i], i);
    }
  };

  return {
    getinput: function () {
      return {
        type: document.querySelector(stringsDOM.inputType).value, // will be either inc or exp
        description: document.querySelector(stringsDOM.inputDescription).value,
        value: parseFloat(document.querySelector(stringsDOM.inputValue).value),
      };
    },

    addListItem: function (obj, type) {
      var html, newHTML, element;
      //Create HTML string with placeholder text
      if (type === "inc") {
        element = stringsDOM.incomeCont;
        html =
          '<div class="item clearfix" id="inc-%id%"> <div class="item__description">%description%</div>' +
          '<div class="right clearfix"> <div class="item__value">%value%</div><div class="item__delete">' +
          '<button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
      } else if (type === "exp") {
        element = stringsDOM.expensesCont;
        html =
          '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix">' +
          '<div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete">' +
          '<button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
      }

      //Replace the placeholder text with some actual data
      newHTML = html.replace("%id%", obj.id);
      newHTML = newHTML.replace("%description%", obj.description);
      newHTML = newHTML.replace("%value%", formatNumber(obj.value, type));

      //Insert the HTML into the DOM
      document.querySelector(element).insertAdjacentHTML("beforeend", newHTML);
    },

    deleteListItem: function (selectorID) {
      var el = document.getElementById(selectorID);
      el.parentNode.removeChild(el);
    },

    clearFields: function () {
      var fields, fieldsArr;

      fields = document.querySelectorAll(
        stringsDOM.inputDescription + ", " + stringsDOM.inputValue
      );
      fieldsArr = Array.prototype.slice.call(fields);

      fieldsArr.forEach(function (current, index, array) {
        current.value = "";
      });
      fieldsArr[0].focus();
    },

    displayBudget: function (obj) {
      obj.budget > 0 ? (type = "inc") : (type = "exp");
      document.querySelector(stringsDOM.budgetLabel).textContent = formatNumber(
        obj.budget,
        type
      );
      document.querySelector(stringsDOM.incomeLabel).textContent = formatNumber(
        obj.totalInc,
        "inc"
      );
      document.querySelector(
        stringsDOM.expensesLabel
      ).textContent = formatNumber(obj.totalExp, "exp");
      if (obj.percentage > 0) {
        document.querySelector(stringsDOM.percentageLabel).textContent =
          obj.percentage + "%";
      } else if (obj.percentage === -1) {
        document.querySelector(stringsDOM.percentageLabel).textContent = "~";
      }
    },

    displayPercentages: function (percentages) {
      var fields = document.querySelectorAll(stringsDOM.expensesPercLabel);

      nodeListForEach(fields, function (current, index) {
        if (percentages[index] > 0) {
          current.textContent = percentages[index] + "%";
        } else {
          current.textContent = "~";
        }
      });
    },

    displayMonth: function () {
      var now, year, month, months, day;
      now = new Date();
      year = now.getFullYear();

      months = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ];
      month = now.getMonth();
      day = now.getDay();

      document.querySelector(stringsDOM.dateLabel).textContent =
        day + " " + months[month] + " " + year;
    },

    changedType: function () {
      var fields = document.querySelectorAll(
        stringsDOM.inputType +
          "," +
          stringsDOM.inputDescription +
          "," +
          stringsDOM.inputValue
      );
      nodeListForEach(fields, function (cur) {
        cur.classList.toggle("red-focus");
      });

      document.querySelector(stringsDOM.inputBtn).classList.toggle("red");
    },

    getStringsDOM: function () {
      return stringsDOM;
    },
  };
})();
//Global APP controller
var controller = (function (budegetCtrl, UICtrl) {
  var setupEventLinteners = function () {
    var DOM = UICtrl.getStringsDOM();
    document.querySelector(DOM.inputBtn).addEventListener("click", ctrlAddİtem);

    document.addEventListener("keypress", function (event) {
      if (event.keyCode === 13 || event.which === 13) {
        ctrlAddİtem();
      }
    });
    //Setting up the DELETE Event Listener Using Event Delegation
    document
      .querySelector(DOM.container)
      .addEventListener("click", ctrlDeleteItem);

    document
      .querySelector(DOM.inputType)
      .addEventListener("change", UICtrl.changedType);
  };

  var updateBudget = function () {
    //1. calculate the budget
    budegetCtrl.calculateBudget();
    //2.return the budget
    var budget = budegetCtrl.getBudget();
    //3. display the budget on the UI
    UICtrl.displayBudget(budget);
  };

  var updatePercentage = function () {
    //1. Calculate the percentage
    budegetCtrl.calculatePerc();
    //2. Read percentafes ffrom the budget controller
    var percentages = budegetCtrl.getPercentages();
    //3. Update the UI with the new percentages
    UICtrl.displayPercentages(percentages);
  };

  var ctrlAddİtem = function () {
    var input, newItem;
    //1. get the field input data
    input = UICtrl.getinput();

    if (input.description !== "" && !isNaN(input.value) && input.value > 0) {
      //2. add the item to the budget controller
      newItem = budegetCtrl.addItem(input.type, input.description, input.value);

      //3. add the item to the UI
      UICtrl.addListItem(newItem, input.type);

      //4. clear the fields
      UICtrl.clearFields();

      //5. calculate and update the buget
      updateBudget();

      //6. calculate and update percentage
      if (input.type === "exp") {
        updatePercentage();
      }
    }
  };

  var ctrlDeleteItem = function (event) {
    var itemID, splitID, type, ID;
    itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

    if (itemID) {
      splitID = itemID.split("-");
      type = splitID[0];
      ID = parseInt(splitID[1]);

      //1. delete the item from the data structure
      budegetCtrl.deleteItem(type, ID);

      //2. delete the item from UI
      UICtrl.deleteListItem(itemID);

      //3. Update and show the new budget
      updateBudget();
    }
  };

  return {
    init: function () {
      console.log("Application has started.");
      UICtrl.displayMonth();
      UICtrl.displayBudget({
        budget: 0,
        totalInc: 0,
        totalExp: 0,
        percentage: -1,
      });
      setupEventLinteners();
    },
  };
})(budgetController, UIController);

controller.init();
