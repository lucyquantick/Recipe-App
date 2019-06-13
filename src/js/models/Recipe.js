import axios from 'axios';
import { key } from '../config';

export default class Recipe {
    constructor(id){
        this.id = id;
    }
    
    async getRecipe(){
        try {
            
            const result = await axios(`https://www.food2fork.com/api/get?key=${key}&rId=${this.id}`);
            this.title = result.data.recipe.title;
            this.author = result.data.recipe.publisher;
            this.img = result.data.recipe.image_url;
            this.url = result.data.recipe.source_url;
            this.ingredients = result.data.recipe.ingredients;
            
        } catch (error){
            console.log(error);
            alert('something went wrong :(');
        }
    }
    calcTime(){
        // assuming need 15 minutes for every 3 ingredients
        const numIng = this.ingredients.length;
        const periods = Math.ceil(numIng / 3);
        this.time = periods * 15;
    }
    
    calcServings(){
        this.servings = 4;
    }
    
    parseIngredients(){
        const unitsLong = ['tablespoons', 'tablespoon', 'ounces', 'ounce', 'teaspoons', 'teaspoon', 'cups', 'pounds'];
        const unitsShort = ['tbsp', 'tbsp', 'oz', 'oz', 'tsp', 'tsp', 'cup', 'pound'];
        const units = [...unitsShort, 'kg', 'g'];
        const newIngredients = this.ingredients.map(el => {
            // 1. uniform units
            let ingredient = el.toLowerCase();
            unitsLong.forEach((unit, i) => {
                ingredient = ingredient.replace(unit, unitsShort[i]);
            });
            
            // 2. remove ()
            ingredient = ingredient.replace(/ *\([^)]*\) */g, ' ');            
            
            // 3. parse ingredients into count, unit and ingredient
            const arrIng = ingredient.split(' ');
            const unitIndex = arrIng.findIndex(el2 => units.includes(el2));
            
            let objIng;
            if (unitIndex > -1) {
                // there is a unit
                // e.g. 4 1/2 cups, arrCont is [4, 1/2] --> eval("4+1/2") --> 4.5
                // e.g. 4 cups, arrCount is [4]
                const arrCount = arrIng.slice(0, unitIndex);
                let count;
                if (arrCount.length === 1) {
                    count = eval(arrIng[0].replace('-', '+'));
                } else {
                    count = eval(arrIng.slice(0, unitIndex).join('+'));
                }
                
                objIng = {
                    count,
                    unit: arrIng[unitIndex],
                    ingredient: arrIng.slice(unitIndex + 1).join(' ')
                };
                
            } else if (parseInt(arrIng[0], 10)) {
                // no unit but first element is a number 
                objIng = {
                    count: parseInt(arrIng[0], 10),
                    unit: '',
                    ingredient: arrIng.slice(1).join(' ')
                }
            } else if (unitIndex === -1) {
                // there is no unit and no number in 1st position
                objIng = {
                    count: 1,
                    unit: '',
                    ingredient
                }
            }
            
            
            return objIng;
            
        });
        this.ingredients = newIngredients;
    }
    
    updateServings(type) {
        // update servings
        const newServings = type === 'dec' ? this.servings -1 : this.servings + 1;
        
        // update ingredients
        this.ingredients.forEach(ing => {
            ing.count *= newServings / this.servings;
        });
        
        this.servings = newServings;
    }
}



