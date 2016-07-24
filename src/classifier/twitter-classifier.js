
  /***************************************************************************/
  /* Augeo.io is a web application that uses Natural Language Processing to  */
  /* classify a user's internet activity into different 'skills'.            */
  /* Copyright (C) 2016 Brian Redd                                           */
  /*                                                                         */
  /* This program is free software: you can redistribute it and/or modify    */
  /* it under the terms of the GNU General Public License as published by    */
  /* the Free Software Foundation, either version 3 of the License, or       */
  /* (at your option) any later version.                                     */
  /*                                                                         */
  /* This program is distributed in the hope that it will be useful,         */
  /* but WITHOUT ANY WARRANTY; without even the implied warranty of          */
  /* MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the           */
  /* GNU General Public License for more details.                            */
  /*                                                                         */
  /* You should have received a copy of the GNU General Public License       */
  /* along with this program.  If not, see <http://www.gnu.org/licenses/>.   */
  /***************************************************************************/

  /***************************************************************************/
  /* Description: Augeo Classifier Generator for Twitter                     */
  /*  - Each class/category has 3 levels of weight. Tier 1 bares the most    */
  /*    weight and Tier 3 the least.This is accomplished by adding the Tier1 */
  /*    documents 3 times and the Tier3 document only once                   */
  /*  - Each class category has an equal amount of documents trained since   */
  /*    this number affects the score                                        */
  /***************************************************************************/

  // Required libraries
  var Logger = require('../module/logger');
  var Natural = require('natural');

  // Constants
  var CLASSIFIER = 'twitter-classifier';

  // Global variables
  var classifier = null;
  var log = new Logger();

  // Constructor
  function TwitterClassifier() {

    // TwitterClassifier is a singleton
    if (!TwitterClassifier.classifier) {
      this.init();
      TwitterClassifier.classifier = this;
    }

    return TwitterClassifier.classifier;
  };

  TwitterClassifier.prototype.classify = function(text, logData) {
    log.functionCall(CLASSIFIER, 'classify', logData.parentProcess, logData.username, {'text':text});
    return classifier.classify(text);
  };

  TwitterClassifier.prototype.getClassifications = function(text, logData) {
    log.functionCall(CLASSIFIER, 'getClassifications', logData.parentProcess, logData.username, {'text':text});
    return classifier.getClassifications(text);
  };

  TwitterClassifier.prototype.init = function init() {
    log.functionCall(CLASSIFIER, 'init');

    classifier = new Natural.BayesClassifier();

    // Add documents to the classifier
    addGeneralDocuments();
    addBookDocuments();
    addBusinessDocuments();
    addFilmDocuments();
    addFoodDocuments();
    addMusicDocuments();
    addPhotographyDocuments();
    addSportsDocuments();
    addTechnologyDocuments();

    classifier.train();

    classifier.save('./classifier/TwitterClassifier.json', function(err, classifier) {});
  };

  /***************************************************************************/
  /* BOOKS                                                                   */
  /***************************************************************************/

    var addBookDocuments = function() {
      /* TODO:
      1. Authors
      2. Book Titles
      */
      var booksTier1 = "literature read book author write publisher sentence editor bestselling seller draft page outline chapter novel tale " +
      "narrate punctuation paragraph prologue articulate fiction fantasy sci-fi biography fanfiction folklore mystery comic  " +
      "POV";

      var booksTier2 = "critique trilogy character theme language depict series genre drama romance comedy horror review dialogue classic sequel text " +
      "verb poet summary content verbose prolix turgid protagonist antagonist word message conceptual suspense thriller twist plot story ";

      var booksTier3 = "rhetorical vague recommend conceptual conclusion conflict stars develop forward letter";

      classifier.addDocument(booksTier1,"Books");
      classifier.addDocument(booksTier1,"Books");
      classifier.addDocument(booksTier1,"Books");
      classifier.addDocument(booksTier2,"Books");
      classifier.addDocument(booksTier2,"Books");
      classifier.addDocument(booksTier3,"Books");
    };

  /***************************************************************************/
  /* Business                                                                */
  /***************************************************************************/

    var addBusinessDocuments = function() {
      /* TODO:
      1. Stock Tickers
      2. People
      3. Numbers
      4. Symbols
      */
      var businessTier1 = "business market chairman finance economics stock funds entrepreneur invest portfolio cofounder ceo venture executive sales " +
      "roth ira corporate debt customer enterprise irs budget VC bonds income taxes crowdfunding vendor revenue franchise Dow " +
      "NASDAQ ";

      var businessTier2 = "growth index founder company million billion sell buy price spend paycapital fortune startup shares lawsuit commercial " +
      "sector produce interview hire unemploy commerce margin acquisition";

      var businessTier3 = "mutual money consult strategy partner opportunity valuation career job employee afford boss freelance contract" +
      "contractor risk worth deal leader lead trade product rich value";

      classifier.addDocument(businessTier1,"Business");
      classifier.addDocument(businessTier1,"Business");
      classifier.addDocument(businessTier1,"Business");
      classifier.addDocument(businessTier2,"Business");
      classifier.addDocument(businessTier2,"Business");
      classifier.addDocument(businessTier3,"Business");
    };

  /***************************************************************************/
  /* Film                                                                    */
  /***************************************************************************/

    var addFilmDocuments = function() {
      /* TODO:
      1. TV Show/Movie Titles
      2. Actors/Actresses/Directors/Producers
      3. Movie Company Names
      4. TV Show Compay Names
      */
      var filmTier1 = "film show director direct producer oscars actor actress emmy dvd movie cast sitcom hollywood episode";

      var filmTier2 = "tv television sequel media finale cinema backstage season drama comedy crew dvr";

      var filmTier3 = "direct produce watch nominate airs performance fans tune";

      classifier.addDocument(filmTier1,"Film");
      classifier.addDocument(filmTier1,"Film");
      classifier.addDocument(filmTier1,"Film");
      classifier.addDocument(filmTier2,"Film");
      classifier.addDocument(filmTier2,"Film");
      classifier.addDocument(filmTier3,"Film");
    };

  /***************************************************************************/
  /* Food                                                                    */
  /***************************************************************************/

    var addFoodDocuments = function() {
      /* TODO:
      1. Foods (Ingrediants/Meals)
      2. Restaurants
      3. Cooking tools
      */
      var foodTier1 = "breakfast lunch dinner brunch ingredient dessert meal food restaurant chef bake recipe cook edible oven stove feast menu " +
                      "delicious eat";

      var foodTier2 = "serve beer";

      var foodTier3 = "supermarket drink";

      classifier.addDocument(foodTier1,"Food & Drink");
      classifier.addDocument(foodTier1,"Food & Drink");
      classifier.addDocument(foodTier1,"Food & Drink");
      classifier.addDocument(foodTier2,"Food & Drink");
      classifier.addDocument(foodTier2,"Food & Drink");
      classifier.addDocument(foodTier3,"Food & Drink");
    };

  /***************************************************************************/
  /* Food                                                                    */
  /***************************************************************************/

  var addGeneralDocuments = function() {

    /* TODO:
    1. Holidays
    */
    var generalTier1 = " happy birthday holiday merry christmas church celebrate friends family boyfriend girlfriend thankful thank graduate memory memories " +
                       "bestfriend dog pet cat santa celebrate celebration selfie mom dad brother sister niece nephew grandparents grandma grandpa " +
                       "congrats congratulations vacation";

    var generalTier2 = "parents children child baby tradition drunk";

    var generalTier3 = "miss love cute pretty fun";


    classifier.addDocument(generalTier1,"General");
    classifier.addDocument(generalTier1,"General");
    classifier.addDocument(generalTier1,"General");
    classifier.addDocument(generalTier2,"General");
    classifier.addDocument(generalTier2,"General");
    classifier.addDocument(generalTier3,"General");
  };

  /***************************************************************************/
  /* Music                                                                   */
  /***************************************************************************/

    var addMusicDocuments = function() {
      /* TODO:
      1. Artists/bands
      */
      var musicTier1 = "music song album band concert soundtrack rap country";

      var musicTier2 = "backstage artist performace perform rock hip hop techno edm";

      var musicTier3 = "listen voice nominated nominate";

      classifier.addDocument(musicTier1,"Music");
      classifier.addDocument(musicTier1,"Music");
      classifier.addDocument(musicTier1,"Music");
      classifier.addDocument(musicTier2,"Music");
      classifier.addDocument(musicTier2,"Music");
      classifier.addDocument(musicTier3,"Music");
    }

  /***************************************************************************/
  /* Photography                                                             */
  /***************************************************************************/

    var addPhotographyDocuments = function() {
      /* TODO:
      1. If photo has photo
      */
      var photographyTier1 = "photo photography picture camera image";

      var photographyTier2 = "";

      var photographyTier3 = "sharp shots";

      classifier.addDocument(photographyTier1,"Photography");
      classifier.addDocument(photographyTier1,"Photography");
      classifier.addDocument(photographyTier1,"Photography");
      classifier.addDocument(photographyTier2,"Photography");
      classifier.addDocument(photographyTier2,"Photography");
      classifier.addDocument(photographyTier3,"Photography");
    }

  /***************************************************************************/
  /* Sports                                                                  */
  /***************************************************************************/

      var addSportsDocuments = function() {
      /* TODO:
      1. Sport Names
      2. Sport Players Names
      3. Sport Positions
      */
      sportsTier1 = "ball cleats tailgate touchdown defense offense jersey championship superbowl athlete athletic champion league victory victor ";
      "basketball baseball football golf soccer cricket hockey tennis racquetball swimming volleyball nfl nba pga nhl mlb crossfit nascar"

      sportsTier2 = "defeated player play pass win won winner loser lost team game score scoreboard finals";

      sportsTier3 = "season recap upset";

      classifier.addDocument(sportsTier1,"Sports");
      classifier.addDocument(sportsTier1,"Sports");
      classifier.addDocument(sportsTier1,"Sports");
      classifier.addDocument(sportsTier2,"Sports");
      classifier.addDocument(sportsTier2,"Sports");
      classifier.addDocument(sportsTier3,"Sports");
    };

  /***************************************************************************/
  /* Technology                                                              */
  /***************************************************************************/

    var addTechnologyDocuments = function() {
      /* TODO:
      1. Products
      2. Tech Companies
      */
      var technologyTier1 = "science scientific scientist hack hacker research researcher algorithms technology tech hardware software coding" +
      "robot drone innovation automation automate autonomy autonomous app application virtual digital wearable developer" +
      "patent nano circuit bit byte server enginner biology physics math ram cyber DIY genetic prototype";

      var technologyTier2 = "program computer discover surveillance develop network smartphone bandwidth electrical cloud";

      var technologyTier3 = "conference device phone analytics internet future gadget feature space design";

      classifier.addDocument(technologyTier1,"Technology");
      classifier.addDocument(technologyTier1,"Technology");
      classifier.addDocument(technologyTier1,"Technology");
      classifier.addDocument(technologyTier2,"Technology");
      classifier.addDocument(technologyTier2,"Technology");
      classifier.addDocument(technologyTier3,"Technology");
    };

    module.exports = TwitterClassifier;
