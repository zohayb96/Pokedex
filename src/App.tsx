import React, { useEffect, useState } from "react";
import pokeball from "./assets/pokeball.svg";
import pokedexImage from "./assets/pokedex.png";
import {
  ApolloProvider,
  useQuery
} from "@apollo/client";
import poketeam from "./assets/poketeam.png";
import "./App.css";
import { capitalizeFirstLetter, query, client } from "./Helpers";
import { PokemonDataStructure, PokemonFormProps, FormDataStructure } from "./DataForms";

// Save Pokemon in set make unique , add Joby login to allow people to only own on pokemonand they have to trade to swap

// Configurable System Limits
let POKEMONTEAMLIMIT = 6;

// Main App and State
function App() {
  const [pokemonsGQL, setPokemonGQL] = useState<PokemonDataStructure[]>([]);
  const [pokemonsTeam, setPokemonsTeam] = useState<PokemonDataStructure[]>([]);
  const [currentPokemon, setCurrentPokemon] = useState<PokemonDataStructure>();
  const [teamDataReset, setTeamDataReset] = useState<PokemonDataStructure[]>([]);
  const [showDetails, setShowDetails] = useState(false);
  const [updateMe, setUpdateMe] = useState(Boolean)

  // Set Local Storage When pokemonsGQL is called - first load
  useEffect(() => {
    const pokemonTeamLocalStorage = localStorage.getItem("pokemonTeam");
    // This sets local storage if it doesn't exist 
    if (pokemonTeamLocalStorage === null) {
      localStorage.setItem("pokemonTeam", JSON.stringify([]));
    }
    if (pokemonTeamLocalStorage !== null) {
      setPokemonsTeam(JSON.parse(pokemonTeamLocalStorage));
    }
  }, []);

  // Initial API Call to Load the Data from GraphQL
  let QueryPokemons = () => {
    const { loading, error, data, } = useQuery(query);
    if (loading && pokemonsGQL.length === 0) return <p style={{ fontFamily: 'monospace', fontSize: '24px' }}>Booting up Pokedex...</p>;
    if (error) return <p>Error : {error.message}</p>;
    if (pokemonsGQL.length === 0) {
      setPokemonGQL(data.gen3_species);
      // Cached the data
      setTeamDataReset(data.gen3_species);

    }
    return null;
  };

  // Show Details
  const showPokemonDetails = (pokemon: PokemonDataStructure) => {
    setCurrentPokemon(pokemon);
    console.log("pokemon: ", pokemon);
    showDetails ? setShowDetails(false) : setShowDetails(true);
  };

  // REMOVE
  const removePokemonFromTeam = (currentPokemon: PokemonDataStructure) => {
    let currentTeam = localStorage.getItem("pokemonTeam");
    if (currentTeam !== null) {
      let tmp = JSON.parse(currentTeam);
      let idx = tmp.findIndex((p: { id: any; }) => p.id === currentPokemon.id);
      if (idx >= 0) {
        tmp.splice(idx, 1);
        setPokemonsTeam(tmp);
        localStorage.setItem("pokemonTeam", JSON.stringify(tmp));
      } else {
        console.log("Not found!");
      }
    }
  };

  // ADD
  const addPokemonToTeam = (pokemon: PokemonDataStructure) => {
    let currentTeam = localStorage.getItem("pokemonTeam");
    let currentPokemon = {
      id: pokemon.id,
      name: capitalizeFirstLetter(pokemon.name),
      base_happiness: pokemon.base_happiness,
      is_legendary: pokemon.is_legendary,
      is_mythical: pokemon.is_mythical,
      generation_id: pokemon.generation_id,
      evolutions: pokemon.evolutions,
    };
    let tmp;
    if (currentTeam !== null) {
      tmp = JSON.parse(currentTeam);
      if (tmp.length < POKEMONTEAMLIMIT) {
        tmp.push(currentPokemon);
        setPokemonsTeam(tmp);
      } else {
        console.log("Team is full");
      }
    }
    localStorage.setItem("pokemonTeam", JSON.stringify(tmp));
  };

  // Drag and Drop Functionality - moves to front of team
  let handleDragAndDrop = (
    event: React.DragEvent<HTMLDivElement>,
    pokemon1: any
  ) => {
    setPokemonsTeam(pokemonsTeam.sort(function (x: any, y: any) { return x === pokemon1 ? -1 : y === pokemon1 ? 1 : 0; }))
    setUpdateMe(!updateMe)
    localStorage.setItem("pokemonTeam", JSON.stringify(pokemonsTeam));
  };

// Sets the pokeball icon if pokemon is in team or not
  const setPokeballIcon = (pokemonRow: PokemonDataStructure) => {
    var foundIds = pokemonsTeam.filter((pokemon) => pokemon.id === pokemonRow.id);
    let pokemon;
    foundIds.length > 0
      ? (pokemon = (
        <img
          alt="Img"
          title={`${capitalizeFirstLetter(
            pokemonRow?.name
          )} is in your team!`}
          src={pokeball}
          className="commonPokeballIconStyle"
        />
      ))
      : (pokemon = (

        <div
          onClick={() => addPokemonToTeam(pokemonRow)}
          title="Press to catch this Pokemon!"
          className="emptyPokeball"
        />
      ));
    return pokemon;
  }

  // Pokemon Team Table
  const PokemonTeamTable: React.FC = () => {
    return pokemonsTeam.length === 0 ? (
      <p style={{ fontSize: "18px" }}>Press White Cirlce Next To Pokemon To Add From Pokedex</p>
    ) : (
      <div>
        {pokemonsTeam.map((pokemon) => (
          <div style={{ display: "grid" }} draggable onDragEnd={(event) => handleDragAndDrop(event, pokemon)}>
            <div className="commonPokemonStyle">
              <div style={{ maxWidth: "33%", height: "100%", cursor: "pointer" }}>
                <img
                  alt="pokemon"
                  className="teamPokemon"
                  src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.id}.png`}
                  onClick={() => showPokemonDetails(pokemon)}
                />
              </div>
              <p style={{ fontWeight: "400", color: "white" }}>{capitalizeFirstLetter(pokemon.name)}</p>
              <button onClick={() => removePokemonFromTeam(pokemon)} className="commonButtonStyle">
                x
              </button>
            </div>
          </div>
        ))}
      </div>
    );
  };

  // View for Pokedex Table
  const PokedexTable: React.FC = () => {
    // ... (Previous code)
    return (
      <>
        <div className="pokemonCard" style={{
          display: showDetails ? "block" : "none",
          background: currentPokemon?.is_legendary
            ? "#c9e1fa"
            : currentPokemon?.is_mythical
              ? "#e1c9fa"
              : "#bfbfbf",
        }}>
          <div style={{ display: "inline-flex", alignItems: "center", width: "100%", justifyContent: "space-between" }}>
            <div style={{ textAlign: 'start' }}>
              <p style={{ color: "black", fontSize: "20px", margin: "0px" }}>
                ID: {currentPokemon?.id.toString().padStart(3, "0")}{" "}
              </p>
              <p style={{ color: "black", fontSize: "20px", margin: "0px" }}>
                Gen: {currentPokemon?.generation_id?.toString().padStart(2, "0")}{" "}
              </p>
            </div>
            <button className="altButtonStyle" onClick={() => setShowDetails(false)}>
              X
            </button>
          </div>
          <div>
            <p style={{ color: "black", fontFamily: "fantasy", fontWeight: "bold" }}>{currentPokemon?.name}</p>
            <img alt="pokemon" src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${currentPokemon?.id}.png`} />
          </div>
          <div>
            {currentPokemon?.is_legendary ? (
              <p style={{ color: "black", fontSize: "20px", fontFamily: "fantasy", fontWeight: "bolder" }}>Legendary</p>
            ) : (
              <> </>
            )}
            {currentPokemon?.is_mythical ? (
              <p style={{ color: "black", fontSize: "20px", fontFamily: "fantasy", fontWeight: "bolder" }}>Mythical</p>
            ) : (
              <> </>
            )}
          </div>
          {/* {currentPokemon?.evolutions?.length >= 1 ? (
              <p style={{ color: "black", fontWeight: "bold", fontFamily: "fantasy", fontSize: "20px" }}>Evolution Chain:</p>
            ) : (
              <> </>
            )} */}
          {currentPokemon?.evolutions.evolutionsChain.length <= 1 ? (<></>) : (
            (
              <>
                <p style={{ color: "black", fontWeight: "bold", fontFamily: "fantasy", fontSize: "20px" }}>Evolution Chain:</p>
                {currentPokemon?.evolutions?.evolutionsChain?.map((val: any) => (
                  <p style={{ color: "black", fontSize: "20px", fontFamily: "fantasy", margin: "0px" }}>
                    {capitalizeFirstLetter(val.name)}
                  </p>
                ))}
              </>
            )
          )}
        </div>
        {pokemonsGQL.map((pokemon) => (
          <>
            <div style={{ display: "flex", minWidth: "100%", alignItems: "center", background: "#d92d2b" }}>
              <div>{setPokeballIcon(pokemon)}</div>
              <li
                className="pokemonListRow"
              >
                <div style={{ maxWidth: "33%", height: "100%", display: "flex" }}>
                  <img
                    style={{ cursor: "pointer" }}
                    title="Click to show details "
                    onClick={() => showPokemonDetails(pokemon)}
                    alt="Img"
                    src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.id}.png`}
                  />
                </div>
                <div style={{ color: "black", width: "100%", display: "flex", alignItems: "baseline", }}>
                  <p style={{ color: "black", paddingRight: "20px", fontSize: "16px", fontFamily: "fantasy" }}>
                    {pokemon.id.toString().padStart(3, "0")}{" "}
                  </p>
                  <p style={{ color: "black", fontWeight: "600", width: "100%", fontFamily: "fantasy" }}>
                    {capitalizeFirstLetter(pokemon.name)}
                  </p>
                </div>
              </li>
            </div>
          </>
        ))}
      </>
    );
  };

  // FORM DATA
  function PokemonForm({ onSubmit }: PokemonFormProps) {
    const [formData, setFormData] = React.useState<FormDataStructure>({
      name: "",
    });

    function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
      const { name, value } = event.target;
      setFormData({ ...formData, [name]: value });
    }

    function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
      event.preventDefault();
      let filtered = teamDataReset.filter(function (el) {
        return (
          el.name.toLowerCase().indexOf(formData.name.toLowerCase()) > -1
        );
      });
      setPokemonGQL(filtered);
      onSubmit(formData);
    }

    return (
      <form onSubmit={handleSubmit} style={{ paddingBottom: "5px" }}>
        <input
          type="text"
          autoComplete="off"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Search"
          className="inputForm"
        />
        <button className="fantasyButton" type="submit">
          Search
        </button>
      </form>
    );
  }

  function handleSubmit(formData: FormDataStructure) {
    console.log("Form Data: ", formData);
  }

  // Main App
  return (
    <ApolloProvider client={client}>
      <div className="App">
        <header className="App-header">
          <div className="row">
            <div className="column">
              <div className="pokemonTeam">
                <div className="centered">
                  <img alt="pokemon" src={poketeam} height={80} />
                </div>
                <div style={{ position: "absolute", top: "0", right: "8px" }}>
                  {pokemonsTeam.length === 0 ? (
                    <p className="team-status">(0 / 6)</p>
                  ) : pokemonsTeam.length < POKEMONTEAMLIMIT ? (
                    <p className="team-status">
                      ({pokemonsTeam.length} / {POKEMONTEAMLIMIT})
                    </p>
                  ) : pokemonsTeam.length === POKEMONTEAMLIMIT ? (
                    <p className="team-status">
                      Team Full! ({pokemonsTeam.length})
                    </p>
                  ) : (
                    <></>
                  )}
                </div>
                <div className="pokeList1">
                  <PokemonTeamTable />
                </div>
              </div>
            </div>
            <div className="pokedex">
              <div
                className="pokedexList"
              >
                {showDetails ? (
                  <img
                    alt="pokemon"
                    src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${currentPokemon?.id}.png`}
                    style={{ display: "block", height: "100%", width: "100%" }}
                  />
                ) : (
                  <></>
                )}
              </div>
              <img
                src={pokeball}
                className="pokeball"
                alt="logo"
                style={{
                  paddingInline: "20px",
                  position: "absolute",
                  right: 0,
                }}
              />
              <div className="pokedexSearch">
                <img alt="pokemon" src={pokedexImage} height={80} />
              </div>
              <div className="pokemonForm">
                <PokemonForm onSubmit={handleSubmit} />
              </div>
              <div className="pokeList">
                {pokemonsGQL.length === 0 ? <QueryPokemons /> : <></>}
                <PokedexTable />
              </div>
            </div>
          </div>
        </header>
      </div>
    </ApolloProvider>
  );
}

export default App;
