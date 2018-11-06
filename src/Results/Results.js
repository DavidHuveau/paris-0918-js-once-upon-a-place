import React, { Component } from "react";
import { AppBar, Tabs, Tab } from "@material-ui/core";
import { FadeLoader } from "react-spinners";
import { Link } from "react-router-dom";
import axios from "axios";

import SimpleMap from "./Map";
import HeaderResults from "./HeaderResults";
import ResultsList from "./ResultList";

import "./Results.css";

class Results extends Component {
  state = {
    isLoaded: false,
    moviesList: [],
    value: 0
  };

  searchLoc = iValue => {

    this.setState({
      isLoaded: false
    });

    const url = `https://data.sfgov.org/resource/wwmu-gmzc.json?$q=${iValue}`;
    axios.get(url).then(res => {
      let moviesList = res.data;
      moviesList = this.transformDatasLocationInMovie(moviesList // on appelle la fonction pour regrouper les lieux par film
        .filter(movie =>
          movie.title.toLowerCase().includes(iValue.toLowerCase())
        )
        .sort((data1, data2) => (data1.title < data2.title ? -1 : 1)) //on trie les titres de film par ordre alphabétique;
      )
      this.setState({
        moviesList,
        isLoaded: true,
      });
    })
    .catch(() =>{
      this.setState({
        moviesList: [],
        isLoaded: true,
      })
    });
  }

  transformDatasLocationInMovie = datasSf => {
    let res = [];
    let data = {};
    let film = []; //ici on initialise ce dont on va avoir besoin dans la fonction (de res à synopsis)
    let add = {};
    const synopsis = "No data available";
    const getFilm = (res, data) => {
      return res.filter(
        f => f.title === data.title && f.release_year === data.release_year
      ); //(on compare le nouveau titre de film )
    }; //qui est inséré dans data avec ceux qui sont déjà dans res (les films) pour voir s'ils ont les mm titres et la mm année pour
    //les regrouper par lieux de tournage

    for (let i = 0; i < datasSf.length; i++) {
      data = datasSf[i];
      film = getFilm(res, data);
      if (!film.length) {
        //équivaut à film.length===0
        add = {
          title: data.title,
          release_year: data.release_year,
          locations: new Array(data.locations),
          synopsis: synopsis,
          director: data.director,
          image:
            "http://www.bsmc.net.au/wp-content/uploads/No-image-available.jpg"
        };
        res.push(add);
      } else {
        getFilm(res, data)[0].locations.push(data.locations); // si y'a un titre pareil, on push pour regrouper par film les lieux
      }
    }
    return res;
  };

  handleChange = (_, iValue) => {
    this.setState({ value: iValue });
  };

  componentDidMount() {
    this.searchLoc(this.props.inputValue);
  };

  render() {
    const { value, moviesList } = this.state;
    const { lift, inputValue } = this.props;
    if (this.state.isLoaded) {
      if (this.state.moviesList.length > 0) {
        return (
          <div className="Results">
            <HeaderResults
              inputValue={inputValue}
              searchLoc={this.searchLoc}
              lift={lift}
            />
            <div className="mobileOnly">
              <div>
                <AppBar position="static">
                  <Tabs value={value} onChange={this.handleChange} centered>
                    <Tab label="List" />
                    <Tab label="Map" />
                  </Tabs>
                </AppBar>
                {value === 0 && <ResultsList moviesList={moviesList} />}
                {value === 1 && <SimpleMap />}
              </div>
            </div>
            <div className="desktopOnly">
              <ResultsList moviesList={moviesList} />
              <SimpleMap />
            </div>
          </div>
        );
      } else {
        return (
          <div className="Results">
            <h2>Your query doesn't match with any movie.</h2>
            <Link className="linkToHome" to="/">
              Make another query
            </Link>
          </div>
        );
      }
    } else {
      return (
        <div className="Results">
          <div className="loadingSpinner">
            <FadeLoader
              sizeUnit={"px"}
              size={150}
              color={"black"}
              loading={!this.state.isloaded}
            />
          </div>
        </div>
      );
    }
  }
}

export default Results;
