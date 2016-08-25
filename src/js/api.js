import axios from 'axios';
import assign from 'lodash/assign';
import map from 'lodash/map';
import filter from 'lodash/filter';
import convert from 'color-convert';
import { rgbToCie } from './color';

export function getLocalIp() {
  return axios
    .get('https://www.meethue.com/api/nupnp')
    .then(res => {
      if (!res.data.length) {
        return new Error('No Hue bridge found.');
      }

      const ip = res.data[0].internalipaddress;

      // Save in storage for easy lookup
      sessionStorage.setItem('hue_ip', ip);
      return ip;
    });
}

export function createUser(ip) {
  return axios
    .post(`http://${ip}/api`, { devicetype: 'netmagazine#mycomputer' })
    .then(res => {
      if (!res.data.length) {
        return new Error('Error creating bridge user.');
      }

      const username = res.data[0].success.username;

      // Save in storage for easy lookup
      sessionStorage.setItem('hue_username', username);
      return username;
    });
}

export function getRooms() {
  const ip = sessionStorage.getItem('hue_ip');
  const username = sessionStorage.getItem('hue_username');

  return axios
    .get(`http://${ip}/api/${username}/groups`)
    .then(res => {
      let data = map(res.data, (d, id) => assign(d, { id }));
      data = filter(res.data, { type: 'Room' });

      sessionStorage.setItem('hue_room', data[0].id);
      return data;
    });
}

export function setRoomColor(rgb) {
  const ip = sessionStorage.getItem('hue_ip');
  const username = sessionStorage.getItem('hue_username');
  const room = sessionStorage.getItem('hue_room');
  const hsl = convert.rgb.hsl(rgb);
  const xy = rgbToCie(rgb);

  return axios
    .put(`http://${ip}/api/${username}/groups/${room}/action`, {
      hue: hsl[0],
      sat: hsl[1],
      bri: hsl[2],
      xy,
    })
    .then(res => console.log(res));
}
