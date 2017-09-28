# Viv AI - Coding Puzzle: Pokedex 1.0

## Introduction
Hi there! My name is Jeet Mehta and the following is an explanation of the Pokedex created by myself, for Viv AI's Coding Puzzle. It will tackle related topics in the following order:
  - Installation/Running the App
  - Unit Testing with Karma
  - Design Decisions/Tradeoffs
  - Current Issues / Future Improvements
  - Conclusion

## Installation / Running the App

After having downloaded and extracted the *pokedex.zip* file, it's necessary to install the required dependences before the application can be launched. If the application is run directly from the provided zip file, the dependencies should already be in place in the *node_modules* folder of the root directory. The app uses a variety of frameworks and tools in order to run, such as React, Material-UI, Karma, Chai and Mocha, so it's necessary for all dependencies to be in place to launch the application successfully. The required dependencies are listed below:

* *npm* package maanger
* NodeJS
* ReactJS
* PubSub.JS
* Babel
* Webpack
* Karma
* Chai
* Mocha
* Material-UI

After having installed the required dependencies, navigate to the root pokedex folder and simply run the following command:

```
npm start
```
If it hasn't automaticaly opened, open *localhost:3000* on your browser, the application should have launched successfully!

## Unit Testing with Karma

Karma was utilized as the test running framework for this application, the tests themselves were bundled using Webpacker and processed using Babel. Currently, the test suite is extremely minimal, and should be expanded to include a whole range of options (see Future Improvements section). However, to run the test suite, please run the following commands:

```
cd src/karma-tests
karma start
```

## Implementation and Design

Having dealt with React for the first time through this challenge, there were definitely a lot of learnings regarding design decisions, abstraction and implementation throughout the development. After going through a brief implementation overview, some of these major decisions will be discussed in detail.

### Implementation

The app is fairly straightforward in terms of implementation. React follows a component based philosophy, so the Pokedex is similarly split into various different components, each responsible for it's own logic and rendering/view. The main components, presented in their parent/child hiearchy are: 
* PokedexApp - shell/wrapper component for the entire app
    * PokedexNavBar - the Navigation bar at the top of the app
        * AutoComplete - Search bar, part of the app's nav bar
    * PokemonList - A list view containing a bullk of the app's info and processing
        * Pokemon - An individual pokemon's grid tile and related info

A basic view of all 151 Pokemon is generated when the application is first launched, and rendered using a simple *fetch* request to the PokeAPI. This just contains the name of the Pokemon, their ID/# and a thumbnail image. In order to minimze load/wait times, other *fetch* calls regarding Pokemon habitats, heights, weights, flavortexts etc were performed only on user search. The implemented feature set allows the user to:

* Search in the app for pokemon using:
    * name
    * id / #
    * type (ie. grass, flying etc)
* Based on search, view the following information for each pokemon:
    * name
    * id
    * thumbnail image
    * height
    * weight
    * types
    * habitats (ie. cave, forest etc)
    * flavor text

### Design Decisions

With a multi-featured application, there were a variety of design choices made throughout the development process that contributed heavily to the app's performance. Some of them are briefly discussed below:

##### 1) Communicating between Child components
Communicating between parent and child components is fairly straightforward in React, it's done using the *props* keyword that's passed down through the constructors of components. However, communicating between child nodes (in this case, the *PokemonList* and the *PokedexNavBar* is a topic that does not have a common consensus regarding implementation.

The main issue/feature where this design decision became vital was the implementation of search, and specifically passing the searched value from the *PokedexNavBar* to the *PokemonList*. After having thought about various event listeners and other options, the simple Publish/Subscribe (PubSub.JS) model was used, where the the *AutoComplete* search bar "publishes" a custom event each time the search field is updated. The *PokemonList* has then "subscribed" to listening to those custom events, and thus can processs, and re-render accordingly. A simple, two line method call allows for this feature to be implemented.

##### 2) API Calls and Structuring
A major and consistent issue throughout the development was dealing with AJAX requests, and related race conditions from *fetch()* calls. Deciding on where to place a bulk of the loading/fetching (whether on initial load, or on a search-basis) heavily influenced the performance and fluidity of the app. Making all the calls in the begining slows the initial load of the app significantly, but has the added advantage of speed and ease-of-use once the data is loaded. Contrastingly, by only performing the *fetch* when required, the initial load of the app is very fast, but wait times for specific searches can be longer.

Ultimately, having tried both methods, I vetted out the first option and went with the second. Despite having longer load times for type-based searches, I felt like the overall application performs much better, and is able to load and move quickly and effeciently.

##### 3) Outsourcing the UI
The final major decision was to outsource the UI / formatting / styling of the application. Deciding to use the Material-UI library was a decision I made very early in the development process, having realized the need to implement some sort of basic styling to obtain a simple, easy-to-use application. Comparing the advantages of custom styling versus the work required to implement/write the appropriate responsive CSS, it made more sense to offload this effort to a well-established library. There were definitely downsides experienced, like being unable to increase the height of the GridTile subtitle cell, however ultimately chosing Material-UI saved a lot of UI-specific development time.

## Current Issues / Future Improvements
Although all the basic and required functionality and features are in place, there are definitely a vast number of improvements regarding bug fixes, as well as new features that can be implemented. While going through the development process, I tried to keep a track of these improvements, such that they can easily be implemented later by myself, or by other developers.

#### Current Issues/Bugs:
* "No match found" text sometimes comes prematurely, or doesn't update in time
* Flavor text for type-based searches faces race condition issues
* Results array can potentially grow larger for many letter-based (type or name) searches
* Fetch calls slow down the application considerably in some cases

#### Future Improvements:
* Better abstraction / restructuring of files -> want to follow a more React based approach where individual components are placed in their own files, and abstracted out. Then, *index.js* just is a small file that instantiates the app, imports and places the necessary components and renders.
* Caching data once loaded, either using localStorage or some other method in order to speed up the application. I tried looking into doing this, but did not achieve much success (the implementation was buggy) and decided to leave it as a future improvement.
* When searching for multi-digit #'s (ie. 132) or a larger string, don't make the necessary *fetch* calls until input is done on the search bar. This would also speed up the application, although determining when exactly a user is done entering items on the search bar is tricky (which is why the current implementation is the way it is)
* Better styling for the GridList, I'm currently truncating the flavor text in order to fit the GridCell limits, a different framework or more development time on the styling side should lead to a better UI.
* Larger unit-test suite, currently just have a test in place to validate rendering of the components. But these tests should be expanded to test logic/processing of the application as well. Try a Test-Driven Development (TDD) approach.

The above improvements, when implemented correctly, should drastically improve the speed and usability of the Pokedex application.

#### Possible Next Features:
Other possible features include:
* Being able to search for multiple types, (ie. grass, poision) at once, as opposed to just one type. Currently I'm looking for exact, singular matches, but a future feature would be to be able to search for pokemon that meet all the searched types (basically a logical AND)
* A view of the different moves that each Pokemon has, and other related information
* A view of the pokemon's evolution, and the ability to traverse through the evolution tree to other pokemon in the Pokedex.
* Possible social features with favoriting certain Pokemon, etc. etc.

## Conclusion

Having no prior background with some of the frameworks involved, this puzzle was an extremely challenging, and fulfilling experience. I received great exposure to React, Node, Karma and a whole range of other web technologies, and can now confidently develop future applications using similar technology. Thanks so much for the opportunity!

Jeet Mehta