# KyotoSearch

**What is this program?**

> React application that allows you to search for 'anime' style art or wallpapers on popular aggregation websites.  

**How do I install and run the program?**

> Type `npm install` to install necesseary npm packages. Type `npm start` to run both the server and client. Your web browser should open to a localhost port running the client. 


List of important files | Description
------------- | -----------
Eclipse.js |         React wrapper for Eclipse.css
Eclipse.css |        Spinning loading animation. Taken from a codepen by [Daria Koutevska](https://codepen.io/DariaIvK/pen/EpjPRM?html-preprocessor=pug). 
Helper.js |   Helper functions for various uses. Mostly used to format text.
Navigation.js |        Includes code for search bar and pagination.
Thumbgrid.js | Includes component for generating a grid of thumbnails.
Thumbnail.js |   Component for a single thumbnail. Used in Thumbgrid.js. 
App.js |        Includes code for page routing as well as initial loaded component to load other components. 
Server.js |        Calls apis for diffrent aggrigators and formats them into its own api. Written to make several calls to aggregators concurrently.


![main](https://github.com/rafihaque7/arcticsearch/blob/master/MainScreenshot.PNG)
