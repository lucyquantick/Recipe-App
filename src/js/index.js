// Global app controller

// api key 2242a40ef080726f3aaf337e22082566
// pete's api key cf5df0a490eacb0677c790419c6c28df
// search api https://www.food2fork.com/api/search

import Search from './models/Search';
import Recipe from './models/Recipe';
import List from './models/List';
import Likes from './models/Likes';
import * as searchView from './views/searchView';
import * as recipeView from './views/recipeView';
import * as listView from './views/listView';
import * as likesView from './views/likesView';
import { elements, renderLoader, clearLoader } from './views/base';

/** Global state of the app
* - Search object
* - Current recipe object
* - Shopping list object
* - Liked recipes
*/
const state = {};
// for testing
window.state = state;

//----------------------SEARCH CONTROLLER--------------------------
const controlSearch = async () => {
   // 1. Get query from view
    // REMOVED FOR TESTING PURPOSES
    const query = searchView.getInput(); 
    // ADDED FOR TESTING 
    //const query = 'pizza'; 
    
    if (query){
        // 2. new search object and add to state
        state.search = new Search(query);
        
        // 3. prepare UI for results
        searchView.clearInput();
        searchView.clearResults();
        renderLoader(elements.searchRes);
        
        try {
            // 4. search for recipes
            await state.search.getResults();
        
            // 5. Render results on UI
            searchView.renderResults(state.search.result);
            clearLoader();
            
        } catch (err) {
            console.log(err);
            alert('Something went wrong with the search');
            
            clearLoader();
        }
    }
}

elements.searchForm.addEventListener('submit', e => {
    e.preventDefault();
    controlSearch();
});

// TESTING
/*window.addEventListener('load', e => {
    e.preventDefault();
    controlSearch();
});*/

elements.searchResPages.addEventListener('click', e => {
    const btn = e.target.closest('.btn-inline');
    if (btn) {
        const goToPage = parseInt(btn.dataset.goto, 10);
        searchView.clearResults();
        searchView.renderResults(state.search.result, goToPage);
    }
});

//----------------------RECIPE CONTROLLER--------------------------

const controlRecipe = async () => {
    // get ID from url
    const id = window.location.hash.replace('#', '');
    //console.log(id);
    
    if (id) {
        // prepare UI for changes
        recipeView.clearRecipe();
        renderLoader(elements.recipe);
        
        // highlight selected search item
        if (state.search) searchView.highlightedSelected(id);
        
        // create new recipe object
        state.recipe = new Recipe(id);
        
        // TESTING
        //window.r = state.recipe;
        
        try {
            // get recipe data and parse ingredients
            await state.recipe.getRecipe();
            state.recipe.parseIngredients();

            //call calcTime and calcServings
            state.recipe.calcTime();
            state.recipe.calcServings();

            // render recipe
            clearLoader();
            recipeView.renderRecipe(
                state.recipe,
                state.likes.isLiked(id)
            );
        } catch (err) {
            console.log(err);
            alert('Error processing recipe');
        }

    }
};


//------------------------LIST CONTROLLER--------------------------

const controlList = () => {
    // create a new list if there is not one already
    if (!state.list) state.list = new List();
    
    // add each ingredient to the list and UI
    state.recipe.ingredients.forEach(el => {
        const item = state.list.addItem(el.count, el.unit, el.ingredient);
        listView.renderItem(item);
    });
}

// handle delete and update list item events
elements.shopping.addEventListener('click', e => {
   const id = e.target.closest('.shopping__item').dataset.itemid;
    
    // handle delete button
    if (e.target.matches('.shopping__delete, .shopping__delete *')) {
        // delete from state
        state.list.deleteItem(id);
        
        // delete from UI
        listView.deleteItem(id);
        
        // handle the count update
    } else if (e.target.matches('.shopping__count-value')) {
        const val = parseFloat(e.target.value, 10);
        state.list.updateCount(id, val)
    }
});


//------------------------LIKE CONTROLLER-----------------------------

const controlLike = () => {
    if (!state.likes) state.likes = new Likes();
    const currentID = state.recipe.id;
    
    // user has not yet liked current recipe
    if (!state.likes.isLiked(currentID)) {
        // add like to the state
        const newLike = state.likes.addLike(
        currentID,
        state.recipe.title,
        state.recipe.author,
        state.recipe.img
        );
        
        // toggle the like button
        likesView.toggleLikeBtn(true);
        
        // add like to UI list
        likesView.renderLike(newLike);
        // console.log(state.likes);
        
    // user has like current recipe
    } else {
        // remove like to the state
        state.likes.deleteLike(currentID);
        
        // tottle the like button
        likesView.toggleLikeBtn(false);
        
        // remove like from UI list
        // console.log(state.likes);
        likesView.deleteLike(currentID);
    }
    
    likesView.toggleLikeMenu(state.likes.getNumLikes());
    
};

/*window.addEventListener('hashchange', controlRecipe);
window.addEventListener('load', constrolRecipe);*/

// add same event listener to different events
['hashchange', 'load'].forEach(event => window.addEventListener(event, controlRecipe));

// handling events when page reloads
// restore liked recipes on page load
window.addEventListener('load', () => {
    state.likes = new Likes();
    
    // restore likes
    state.likes.readStorage();
    
    // toggle like menu button
    likesView.toggleLikeMenu(state.likes.getNumLikes());
    
    // render the existing likes
    state.likes.likes.forEach(like => likesView.renderLike(like));
});

// Handling recipe button clicks
elements.recipe.addEventListener('click', e => {
    if (e.target.matches('.btn-decrease, .btn-decrease *')) {
        // decrease button is clicked
        if (state.recipe.servings > 1) {
             state.recipe.updateServings('dec');
            recipeView.updateServingsIngredients(state.recipe);
        }
       
    } else if (e.target.matches('.btn-increase, .btn-increase *')) {
        // increase button is clicked
        state.recipe.updateServings('inc');
        recipeView.updateServingsIngredients(state.recipe);
        // add ingredients to shopping list
    } else if (e.target.matches('.recipe__btn--add, .recipe__btn--add *')) {
        controlList();
    } else if (e.target.matches('.recipe__love, .recipe__love *')) {
        // call like controller
        controlLike();
    }
  
});

// for testing
const l = new List();
window.l = l;





