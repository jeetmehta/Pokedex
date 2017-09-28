// Import React files
import {render} from 'react-dom';
import React, {Component} from 'react';
import PubSub from 'pubsub-js';

// Needed for onTouchTap
import injectTapEventPlugin from 'react-tap-event-plugin';

// Import Material UI Files
import { AutoComplete }   from 'material-ui';
import MuiThemeProvider   from 'material-ui/styles/MuiThemeProvider';
import AppBar from 'material-ui/AppBar';
import {GridList, GridTile} from 'material-ui/GridList';

// Autocomplete search box
class MaterialUIAutocomplete extends Component {

	// Constructor
	constructor(props) {
		super(props);
		this.onUpdateInput = this.onUpdateInput.bind(this);
		this.state = {
		  dataSource : [],
		  inputValue : ''
		}
	}

	// Call search function each time something is entered in the search bar
	onUpdateInput(inputValue) {
		const self = this;
		this.setState({
		  inputValue: inputValue
		}, function() {
		  self.performSearch();
		});
	}

	// Publish an event for PokeList to read/listen to
	performSearch() {
		PubSub.publish('inputValueChanged', this.state.inputValue);
	}

	// Render and display DOM objects
	render() {
		return (
		  <AutoComplete
		    dataSource    = {this.state.dataSource}
		    onUpdateInput = {this.onUpdateInput}
		    hintText = 'Search for Pokemon' />
			)
	}
}

// Navigation bar for Pokedex
class PokedexNavBar extends Component {

	// Render and display DOM objects
	render() {
		return (
			<MuiThemeProvider>
				<div className = "test--nav--bar">
					<AppBar title = "Pokedex" showMenuIconButton={false} iconElementRight = {<MaterialUIAutocomplete />}>
					</AppBar>
				</div>
			</MuiThemeProvider>
		)
	}
}

// Pokemon base class
class Pokemon extends Component {

	// Constructor
	constructor(props) {
		super(props);
		this.state = {
			name: '',
			height: '',
			weight: '',
			types: [],
			moves: [],
			habitats: [],
			flavor_text: '',
			values_fetched: false,
			url: ''
		};
	}

	// Render and display DOM objects
	render() {
		const {name} = this.props;
		return <div className = "pokemon--species">
					<div className = "pokemon--species--container">
						<div className = "pokemon--species--sprite">
							<img alt = "A Pokemon" src = {"https://img.pokemondb.net/sprites/x-y/normal/" + name.toLowerCase() + ".png"} />
						</div>
					</div>
				</div>;
	}
}

// Fetch data from API and display in list format
class PokemonList extends Component {

	// Constructor -> initialize state
	constructor(props) {
		super(props);
		this.state = {
			species: [],
			output: [],
			heights: [],
			weights: [],
			types: [],
			flavor_text: [],
			habitats: [],
			fetched: false,
			loading: false,
			init_load: false,
		};

		// Bind 'this' to member function, allows it to access 'this'
		this.showSearchResults = this.showSearchResults.bind(this);
		this.getPokemonByName = this.getPokemonByName.bind(this);
		this.loadHabitatAndText = this.loadHabitatAndText.bind(this);
	}

	// Make API requests to fill list with data: executed once before component is mounted onto DOM
	componentWillMount() {

		// Bind 'this' to member function, allows it to access 'this'
		this.showSearchResults = this.showSearchResults.bind(this);
		
		// Bring up loading spinner
		this.setState({
			loading: true
		});
		
		// API Request for Pokemon list and update state once there's a response
		fetch('http://pokeapi.co/api/v2/pokemon?limit=151').then(res=>res.json())
		.then(response=>{

			// Set initial output
			var poke_list = response.results;

			this.setState ({
				output: poke_list,
				species: poke_list,
				loading: false,
				fetched: true,
				init_load: true
			});
		});
	}

	// Add event listener for change in search results
	componentDidMount() {
		this.token = PubSub.subscribe('inputValueChanged', this.showSearchResults);
	}

	// Remove event listener when component is being taken off the DOM
	componentWillUnmount() {
		PubSub.unsubscribe(this.token)
	}

	// Takes in a list of pokemon and their indices, and makes API requests to get: habitat and flavor text
	loadHabitatAndText(poke_list, idx) {
		var temp_habitats = [];
		var temp_text = [];
		for (var i = 0; i < poke_list.length; i++)
		{
			fetch('http://pokeapi.co/api/v2/pokemon-species/' + (idx[i] + 1) + '/').then(res=>res.json()).then(response=> {
				temp_habitats.push(response.habitat.name);
				temp_text.push(response.flavor_text_entries[1].flavor_text);

				this.setState ({
					habitats: temp_habitats,
					loading: true,
					fetched: false,
					flavor_text: temp_text
				});
			});
		}
	}

	// Search logic for Pokelist
	showSearchResults(msg, data)
	{
		// Loading ...
		this.setState({
			loading: true,
			fetched: false
		});

		// Empty search field -> show complete set of pokemon
		if (data === '')
		{
			this.setState({
				output: this.state.species,
				loading: false,
				fetched: true,
				init_load: true
			});
		}

		// Number entered
		else if (!isNaN(+data))
		{
			// Valid index
			if (data >= 1 && data <= 151)
			{

				// API request for habitats and locations
				fetch('http://pokeapi.co/api/v2/pokemon-species/' + data + '/').then(res=>res.json()).then(response=> {
					
					this.setState ({
						habitats: response.habitat.name,
						flavor_text: response.flavor_text_entries[1].flavor_text
					});
				});

				// API request for pokemon's individual data and display results
				fetch(this.state.species[data - 1].url).then(res=>res.json()).then(response=>{

					this.setState({
						output: this.state.species[data - 1],
						weights: response.weight,
						heights: response.height,
						types: response.types,
						loading: false,
						fetched: true,
						init_load: false
					});
				});
			}

			// Invalid index
			else
			{
				if (data > 151) {
					this.setState({
						output: ">151",
						loading: false,
						fetched: true,
						init_load: false
					});
				} else if (data <= 0) {
					this.setState({
						output: "<=0",
						loading: false,
						fetched: true,
						init_load: false
					});
				}
			}
		}

		// Pokemon name or type entered
		else if (typeof(data) === "string")
		{
			// Check if valid pokemon name
			var match_found = false;
			for (var i = 0; i < this.state.species.length; i++)
			{
				// Exact name match
				if (this.state.species[i].name === data.toLowerCase())
				{
					// API request for habitats and locations
					fetch('http://pokeapi.co/api/v2/pokemon-species/' + (i + 1) + '/').then(res=>res.json()).then(response=> {
						
						this.setState ({
							habitats: response.habitat.name,
							flavor_text: response.flavor_text_entries[1].flavor_text
						});
					});

					// API request for pokemon's individual data and display results
					match_found = true
					fetch(this.state.species[i].url).then(res=>res.json()).then(response=>{
						this.setState({
							output: this.getPokemonByName(data.toLowerCase()),
							weights: response.weight,
							heights: response.height,
							types: response.types,
							loading: false,
							fetched: true,
							init_load: false,
						});
					});
				}
			}

			// Check if valid pokemon type
			if (!match_found)
			{
				var type_url = 'http://pokeapi.co/api/v2/type/' + data.toLowerCase() + '/';
				fetch(type_url).then(res=>res.json()).then(response=>{
					
					// Deal with invalid type
					if (!response.detail) {

						var temp_output = [];
						var temp_heights = [];
						var temp_weights = [];
						var temp_types = [];
						var temp_idx = [];

						for (var i = 0; i < response.pokemon.length; i++)
						{
							var own_idx = this.state.species.indexOf(this.getPokemonByName(response.pokemon[i].pokemon.name));
							if (own_idx !== -1)
							{
								temp_output.push(this.state.species[own_idx]);
								temp_idx.push(own_idx);
							}
						}

						// API request for habitat and flavor text 
						this.loadHabitatAndText(temp_output, temp_idx);

						for (var j = 0; j < temp_output.length; j++)
						{
							fetch(temp_output[j].url).then(res=>res.json()).then(response=>{
								temp_heights.push(response.height);
								temp_weights.push(response.weight);
								temp_types.push(response.types);
								this.setState({
									output: temp_output,
									weights: temp_weights,
									heights: temp_heights,
									types: temp_types,
									loading: false,
									fetched: true,
									init_load: false
								});
							});
						}						
					}
					else
					{
						console.log("invalid type");
						this.setState({
							output: "No match found",
							loading: false,
							fetched: true,
							init_load: false
						});
					}
				});
			}
		}
	}

	// Returns pokemon based on name
	getPokemonByName(name) {
		for (var i = 0; i < this.state.species.length; i++)
		{
			if (this.state.species[i].name === name)
				return this.state.species[i];
		}
	}

	// Render and display DOM objects
	render() {
		
		let content;
		const styles = {
			  root: {
			    display: 'flex',
			    flexWrap: 'wrap',
			    justifyContent: 'space-around',
			  },
			  gridList: {
			    overflowY: 'auto',
			  },
			};
		if (this.state.fetched) {

			// Array of objects - Initial complete list
			if (this.state.output.constructor === Array && this.state.init_load)
			{
				content = <MuiThemeProvider>
							<GridList style = {styles.gridList} >{this.state.output.map((pokemon, index) => (
								<GridTile key = {pokemon.name} 
										  title = {pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)}
										  subtitle = {<span><b> ID: </b> {index + 1} </span>}>
									<Pokemon key={pokemon.name} 
											 name={pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)}
											 id={index + 1} url={pokemon.url}
											 pokemon={pokemon} />
								</GridTile>
								))}
							</GridList>
						</MuiThemeProvider>
			}

			// Array of objects - Pokemon type was searched
			else if (this.state.output.constructor === Array && this.state.weights !== [])
			{
				content = <MuiThemeProvider>
							<GridList style = {styles.gridList}>{this.state.weights.map((weight, index) => (
								<GridTile key = {this.state.output[index].name} 
										  title = {this.state.output[index].name.charAt(0).toUpperCase() + this.state.output[index].name.slice(1)}
										  subtitle={
												  	<div style={{fontSize: "10px"}}>
											  			<span>
											  				<b> ID: </b> {index + 1}
											  				<b> Height: </b>{this.state.heights[index]}
											  				<b> Weight: </b>{weight}
										  				</span>
										  				<span>
											  				<b> Types: </b>
											  				<b> Habitat: </b> {this.state.habitats[index]} 
										  				</span>
										  				<p>
											  				<b> Description: </b> {this.state.flavor_text[index].split('.')[0] + '.'}
										  				</p>
									  				</div>}
							  				>
									<Pokemon key={this.state.output[index].name} 
											 name={this.state.output[index].name.charAt(0).toUpperCase() + this.state.output[index].name.slice(1)}
											 id={index + 1} url={this.state.output[index].url}
  											 height={this.state.heights[index]} 
											 weight={weight} 
											 types={this.state.types} 
											 pokemon={this.state.output[index]} />
								</GridTile>
								))}
							</GridList>
						</MuiThemeProvider>
			}

			// Singular object - Pokemon # or name was searched
			else if (typeof(this.state.output) !== "string" && this.state.output.constructor !== Array)
			{
				content = <MuiThemeProvider>
							<GridList style = {styles.gridList}>
								<GridTile style = {{fontSize: '5px'}} key = {this.state.output.name}
										  title = {this.state.output.name.charAt(0).toUpperCase() + this.state.output.name.slice(1)}
										  subtitle={
										  			<div style={{fontSize: "10px"}}>
											  			<span>
											  				<b> ID: </b> {this.state.species.indexOf(this.state.output) + 1}
											  				<b> Height: </b>{this.state.heights}
											  				<b> Weight: </b>{this.state.weights}
										  				</span>
										  				<span>
												  			<b> Types: </b> {this.state.types.map((type, index) => type.type.name + ", ")} 
												  			<b> Habitat: </b> {this.state.habitats}
											  			</span>
											  			<p>
											  				{this.state.flavor_text.split('.')[0] + '.'}
										  				</p>
									  				</div>
									  				}
											>
									<Pokemon key={this.state.output.name}
											 name={this.state.output.name.charAt(0).toUpperCase() + this.state.output.name.slice(1)}
											 id={this.state.species.indexOf(this.state.output) + 1}
											 url={this.state.output.url}
 											 height={this.state.heights} 
											 weight={this.state.weights} 
											 types={this.state.types} 
											 pokemon={this.state.output} />
								</GridTile>
							</GridList>
						</MuiThemeProvider>
			}

			// Invalid Pokemon name was searched: match not found
			else if (typeof(this.state.output) === "string" && this.state.output === "No match found")
			{
				content = <MuiThemeProvider>
							<p> Invalid Pokemon or Pokemon Type : Match not found </p>
						</MuiThemeProvider>
			}

			// Invalid Pokemon # was searched: > 151
			else if (typeof(this.state.output) === "string" && this.state.output === ">151")
			{
				content = <MuiThemeProvider>
							<p> Invalid Pokemon # : This Pokedex only has the first 151 Pokemon </p>
						</MuiThemeProvider>
			}

			// Invalid Pokemon # was searched: <= 0
			else if (typeof(this.state.output) === "string" && this.state.output === "<=0")
			{
				content = <MuiThemeProvider>
							<p> Invalid Pokemon # : Number must be between 1 and 151 </p>
						</MuiThemeProvider>
			}  
		}

		// Still loading
		else if (this.state.loading && !this.state.fetched) {
			content = <p> Loading ... </p>;
		} else {
			content = <div/>;
		}

		// Return content
		return <div>
			{content}
		</div>;
	}
}

// Create root application: PokedexApp
class PokedexApp extends Component {

	// Set state before component is added to DOM
	componentWillMount() {
	}

	// Render and display DOM objects
	render() {
		injectTapEventPlugin();
		return <div className="pokedexapp">
			<PokedexNavBar />
			<PokemonList />
		</div>;
	}
}

// Output
render(<PokedexApp/>,document.getElementById('app'))