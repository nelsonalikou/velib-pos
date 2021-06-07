import {createAuthProvider} from 'react-token-auth';
import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';



const [useAuth, authFetch, login, logout] =
    createAuthProvider({
        accessTokenKey: 'access_token',
        onUpdateToken: (token) => fetch('/api/refresh', {
            method: 'POST',
            body: token.access_token
        })
        .then(r => r.json())
    });


function Home() {
    useEffect(() => {
      fetch("/api").then(resp => resp.json()).then(resp => console.log(resp))
    }, [])
    return <h2>Home</h2>;
  };

function Login() {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
  
    const onSubmitClick = (e)=>{
      e.preventDefault()
      console.log("You pressed login")
      let opts = {
        'username': username,
        'password': password
      }
      console.log(opts)
      fetch('/api/login', {
  method: 'post',
  body: JSON.stringify(opts)
}).then(r => r.json())
  .then(token => {
    if (token.access_token){
      login(token)
      console.log(token)          
    }
    else {
      console.log("Please type in correct username/password")
    }
  })
    }
  
    const handleUsernameChange = (e) => {
      setUsername(e.target.value)
    }
  
    const handlePasswordChange = (e) => {
      setPassword(e.target.value)
    }
    const [logged] = useAuth();
    return (
      <div>
    <h2>Login</h2>
    {!logged? <form action="#">
      <div>
        <input type="text" 
          placeholder="Username" 
          onChange={handleUsernameChange}
          value={username} 
        />
      </div>
      <div>
        <input
          type="password"
          placeholder="Password"
          onChange={handlePasswordChange}
          value={password}
        />
      </div>
      <button onClick={onSubmitClick} type="submit">
        Login Now
      </button>
    </form>
    : <button onClick={() => logout()}>Logout</button>}
  </div>
    )
  };


   function Secret(){
    const [message, setMessage] = useState('')
  
    useEffect(() => {
      authFetch("/api/protected").then(response => {
        if (response.status === 401){
          setMessage("Sorry you aren't authorized!")
          return null
        }
        return response.json()
      }).then(response => {
        if (response && response.message){
          setMessage(response.message)
        }
      })
    }, [])
    return (
      <h2>Secret: {message}</h2>
    )
  };


function Map(){
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
}
export {Secret, Login, Home, Map};