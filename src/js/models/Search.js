// default exports: when you only want to export one thing from a module
//export default 'I am an exported string.';

import axios from 'axios';
import { key } from '../config';

export default class Search {
    constructor(query) {
        this.query = query;
    }
    
    async getResults(){
        try {
            // do the ajax call and return a promise
            const result = await axios(`https://www.food2fork.com/api/search?key=${key}&q=${this.query}`);
            this.result = result.data.recipes;
        
        } catch (error){
            alert(error);
        }

    }
}





