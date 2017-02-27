"use strict";

//Global variable. Recipe component sets editing_id to the id of the Recipe to be edited.
//When changes are saved, the RecipeBox component must save an updated version of the Recipe at
//the index of the original version of the recipe in the state array this.state.recipes
var editing_id;

//RECIPEBOX: Handles a collection of recipe components
var RecipeBox = React.createClass({
  displayName: "RecipeBox",

  unique_id: 4,
  get_id: function get_id() {
    this.unique_id++;return this.unique_id - 1;
  },
  getInitialState: function getInitialState() {
    var stored;
    if (typeof Storage !== 'undefined') {
      var str = localStorage.getItem("_esopp_recipes");
      if (str !== null) stored = JSON.parse(str);else stored = {
        1: { name: "Peanut Butter and Jelly Sandwich", ingredients: ["Bread", "Peanut Butter", "Jelly"] },
        2: { name: "Bread", ingredients: ["Water", "Flour", "Yeast", "Water"] },
        3: { name: "Rice", ingredients: ["Water", "Rice"] }
      };
    } else stored = {
      1: { name: "Peanut Butter and Jelly Sandwich", ingredients: ["Bread", "Peanut Butter", "Jelly"] },
      2: { name: "Bread", ingredients: ["Water", "Flour", "Yeast", "Water"] },
      3: { name: "Rice", ingredients: ["Water", "Rice"] }
    };
    this.unique_id = stored.length + 1;

    return {
      recipes: stored,
      popUps: [{ name: "Create Recipe", save: this.save, cancel: this.cancel }, { name: "Edit Recipe", save: this.edit, cancel: this.canceledit }]
    };
  },
  /** TESTED: SUCCESS!!! **/
  save: function save() {
    $("#add-recipe-button").prop("disabled", false);
    $(".recipe-button").prop("disabled", false);
    $("#create").addClass("popup-hidden");
    var id = this.get_id();
    var name = $("#name-create").val();
    var ingredients = $("#ingredients-create").val();

    if (name != null && name.trim() != "") {
      var recipe = { name: $("#name-create").val(), ingredients: $("#ingredients-create").val().split(",") };
      var arr = [];

      for (var i in recipe.ingredients) {
        if (recipe.ingredients[i].trim() != "") arr.push(recipe.ingredients[i].trim());
      }recipe.ingredients = arr;

      var temp = this.state.recipes;
      temp[id] = recipe;
      this.setState({ recipes: temp });

      var to_stringify = {};
      var index = 1;
      for (var recipe in temp) {
        to_stringify[index] = temp[recipe];
        index++;
      }
      localStorage.setItem("_esopp_recipes", JSON.stringify(to_stringify));
    }
  },
  /** tested: SUCCESS **/
  edit: function edit() {
    var recipe = { name: $("#name-edit").val(), ingredients: $("#ingredients-edit").val().split(",") };
    var arr = [];

    for (var i in recipe.ingredients) {
      if (recipe.ingredients[i].trim() != "") arr.push(recipe.ingredients[i].trim());
    }recipe.ingredients = arr;

    $("#add-recipe-button").prop("disabled", false);
    $(".recipe-button").prop("disabled", false);

    $("#edit").addClass("popup-hidden");
    console.log("called edit");
    var temp = {};
    console.log("temp before edit", temp);
    for (var r in this.state.recipes) {
      if (r == editing_id) temp[r] = recipe;else temp[r] = this.state.recipes[r];
    }
    console.log("temp after edit", temp);
    this.setState({ recipes: temp });

    var to_stringify = {};
    var index = 1;
    for (var recipe in temp) {
      to_stringify[index] = temp[recipe];
      index++;
    }
    localStorage.setItem("_esopp_recipes", JSON.stringify(to_stringify));
  },
  /** tested: SUCCESS!!! **/
  cancel: function cancel() {
    $("#create").addClass("popup-hidden");
    $("#add-recipe-button").prop("disabled", false);
    $(".recipe-button").prop("disabled", false);
  },
  /** tested: SUCCESS!!! **/
  canceledit: function canceledit() {
    $("#edit").addClass("popup-hidden");
    $("#add-recipe-button").prop("disabled", false);
    $(".recipe-button").prop("disabled", false);
  },
  /** tested: SUCCESS **/
  delete: function _delete() {
    var temp = this.state.recipes;
    delete temp[editing_id];
    this.setState({ recipes: temp });

    var to_stringify = {};
    var index = 1;
    for (var recipe in temp) {
      to_stringify[index] = temp[recipe];
      index++;
    }
    localStorage.setItem("_esopp_recipes", JSON.stringify(to_stringify));
  },
  /** tested: SUCCESS **/
  custom_prompt: function custom_prompt() {
    $("#name-create").val("");
    $("#ingredients-create").val("");
    $("#add-recipe-button").prop("disabled", true);
    $(".recipe-button").prop("disabled", true);
    $("#create").removeClass("popup-hidden");
  },
  render: function render() {
    var recipes = [];
    var popups = [];
    for (var r in this.state.recipes) {
      recipes.push(React.createElement(Recipe, { id: r, name: this.state.recipes[r].name, ingredients: this.state.recipes[r].ingredients, "delete": this.delete }));
    }
    for (var p in this.state.popUps) {
      popups.push(React.createElement(PopUp, { name: this.state.popUps[p].name, save: this.state.popUps[p].save, cancel: this.state.popUps[p].cancel }));
    }

    return React.createElement(
      "div",
      null,
      React.createElement(
        "div",
        null,
        React.createElement(
          "div",
          { className: "well recipe-box col-md-8 col-md-offset-2" },
          recipes
        ),
        popups
      ),
      React.createElement(
        "div",
        { className: "add-div" },
        React.createElement(
          "button",
          { id: "add-recipe-button", className: "btn", onClick: this.custom_prompt },
          "ADD RECIPE"
        )
      )
    );
  }
});

//RECIPE: A Recipe object has a List of ingredients, and can expand or collapse when clicked
//props: name: string, ingredients: ["array", "of", "strings"]
var Recipe = React.createClass({
  displayName: "Recipe",

  hidden: true,
  getInitialState: function getInitialState() {
    return {
      display: 0
    };
  },
  edit: function edit() {
    editing_id = this.props.id;
    $("#name-edit").val(this.props.name);
    $("#ingredients-edit").val(this.props.ingredients.join(", "));
    $("#edit").removeClass("popup-hidden");
    $("#add-recipe-button").prop("disabled", true);
    $(".recipe-button").prop("disabled", true);
  },
  /** Expand or colapse the ingredients list of the recipe. **/
  hide: function hide() {
    if (this.hidden) {
      this.hidden = false;
      this.setState({
        display: 1
      });
    } else {
      this.hidden = true;

      this.setState({
        display: 0
      });
    }
  },
  /** Test to make sure the recipe is removed from the RecipeBox. May have to move this function to recipebox **/
  delete: function _delete() {
    editing_id = this.props.id;
    this.props.delete();
  },
  render: function render() {
    var buttons = [null, [React.createElement(
      "button",
      { className: "recipe-button", onClick: this.edit },
      "Edit"
    ), React.createElement(
      "button",
      { className: "recipe-button", onClick: this.delete },
      "Delete"
    )]];
    var list = [null, React.createElement(List, { ingredients: this.props.ingredients })];

    return React.createElement(
      "div",
      { id: this.props.id, className: "well recipe" },
      React.createElement(
        "p",
        { onClick: this.hide, className: "text-center title" },
        this.props.name
      ),
      list[this.state.display],
      buttons[this.state.display]
    );
  }
});

//LIST: tracks and displays a list of ingredients
//props: ingredients
var List = React.createClass({
  displayName: "List",

  render: function render() {

    var ingredients = [];

    for (var i in this.props.ingredients) {
      ingredients.push(React.createElement(
        "div",
        { className: "well" },
        this.props.ingredients[i]
      ));
    }return React.createElement(
      "div",
      { className: "well" },
      React.createElement(
        "h4",
        { className: "text-center" },
        "Ingredients"
      ),
      " ",
      ingredients
    );
  }
});

//POPUP: displays a popup window to add/edit recipes
//props: name (string)
//popup id will be #create or #edit
//make visible by removing class: .popup-hidden
//textarea input fields will have ids of #name-create or #name-edit and #ingredients-create or #ingredients-edit, respectively
var PopUp = React.createClass({
  displayName: "PopUp",

  render: function render() {
    var id = this.props.name.split(" ")[0].toLowerCase();

    return React.createElement(
      "div",
      { id: id, className: "popup popup-hidden" },
      React.createElement(
        "div",
        null,
        React.createElement(
          "div",
          { className: "well" },
          React.createElement(
            "h3",
            { className: "text-center" },
            this.props.name
          )
        ),
        React.createElement(
          "h4",
          { className: "text-center" },
          "RECIPE"
        ),
        React.createElement("textarea", { id: "name-" + id })
      ),
      React.createElement(
        "div",
        null,
        React.createElement(
          "h4",
          { className: "text-center" },
          "INGREDIENTS"
        ),
        React.createElement("textarea", { id: "ingredients-" + id, placeholder: "Separate ingredients with a comma." })
      ),
      React.createElement(
        "div",
        { className: "well" },
        React.createElement(
          "div",
          { className: "btn-div" },
          React.createElement(
            "button",
            { id: "save-" + id, className: "btn btn-primary", onClick: this.props.save },
            "Save"
          )
        ),
        React.createElement(
          "div",
          { className: "btn-div" },
          React.createElement(
            "button",
            { id: "cancel-" + id, className: "btn btn-warning", onClick: this.props.cancel },
            "Cancel"
          )
        )
      )
    );
  }
});

//RENDER THE REACT APP
ReactDOM.render(React.createElement(RecipeBox, null), document.body);