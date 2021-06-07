import React, { Component } from 'react';
import axios from 'axios';
import './App.css';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';

class App extends Component {
  state = {
    coordonnees : [],
    topics: ["Loading..."],
    question: "",
    answer: ""
  }

  componentDidMount() {
    this.fetchTopics()

  }

  fetchTopics = async () => {
    const { data } = await axios.get(
      `${process.env.REACT_APP_API_URL}/get_topics`,
    );
    const { topics } = data;
    this.setState({topics})
  }

  fetchData = async () => {
    const { data } = await axios.get(
      `${process.env.REACT_APP_API_URL}/data`,
    );
    const { coordonnees } = data;
    //affichage
    this.setState({coordonnees})
  }

  handleChange = (event) => {
    this.setState({question: event.target.value});
  }

  handleSubmit = (event) => {
    this.fetchAnswer();
    event.preventDefault();
  }

  fetchAnswer = async () => {
    const { question } = this.state;
    const { data } = await axios.post(
      `${process.env.REACT_APP_API_URL}/submit_question`, { question }
    );
    const { answer } = data;
    this.setState({answer})
  }

  Map = () => {
    const position = [51.505, -0.09]
        
    return(
    <MapContainer center={position} zoom={13} scrollWheelZoom={false}>
        <TileLayer
        attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={position}>
        <Popup>
            A pretty CSS3 popup. <br /> Easily customizable.
        </Popup>
        </Marker>
    </MapContainer>
)
};

  render() {
    const { topics, question, answer } = this.state;
    const{username, password} = '';
    return (
      <div className="App">
        <header className="App-header">
        {this.Map()}
          <form onSubmit={this.handleSubmit}>
          <label>
            Login:
            <input type="text" value={username} onChange={this.handleChange} />
          </label>
          <label>
            Password:
            <input type="password" value={password} onChange={this.handleChange} />
          </label>
          <input type="submit" value="Submit" />
        </form>
        </header>
        <main>
          {this.fetchData}
        </main>
      </div>
    );
  }
}

export default App;