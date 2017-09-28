// Import React files
import {render} from 'react-dom';
import React, {Component} from 'react';

// Navigation bar for Pokedex
class PokedexNavBar extends Component {
	
	// Constructor
	constructor(props) {
		super(props);
	}

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