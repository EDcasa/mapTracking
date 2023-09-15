import { EventEmitter, Injectable } from '@angular/core';
import * as mapboxgl from 'mapbox-gl';
import * as MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';
import { HttpClient } from '@angular/common/http';
import { Socket } from 'ngx-socket-io';


@Injectable({
  providedIn: 'root'
})
export class MapCustomService {

  private MAP_KEY = 'YOUR_KEY_HERE';
  mapbox = (mapboxgl as typeof mapboxgl);
  map!: mapboxgl.Map;
  style = 'mapbox://styles/mapbox/streets-v11';
  lat = 40.416906;
  lng = -3.7056721;
  zoom = 3;
  cbAddress: EventEmitter<any> = new EventEmitter<any>();
  wayPoint:Array<any>=[];
  markerDriver:any;
  constructor(
    private http:HttpClient,
    private socket:Socket
  ) { 
    this.mapbox.accessToken = this.MAP_KEY;
  }

  buildMap():Promise<any>{
    return new Promise((resolve, reject) => {
      try{
        this.mapbox.accessToken = this.MAP_KEY;
        this.map = new mapboxgl.Map({
          container: 'map',
          style: this.style,
          zoom: 13,
          center: [this.lng, this.lat]
        });
        // this.map.addControl(new MapboxGeocoder({
        //   accessToken: this.mapbox.accessToken,
        //   mapboxgl: this.mapbox
        // }));
        // this.map.addControl(new mapboxgl.NavigationControl());
        const geocoder = new MapboxGeocoder({
          accessToken: this.mapbox.accessToken,
          mapboxgl
        });

        geocoder.on('result', (e:any) => {
          console.log(e.result.center);
          const {result} = e;
          geocoder.clear();
          this.cbAddress.emit(result);

        });

        resolve({map: this.map, geocoder})
      } catch (error) {
        reject(error);
      }
    })
    
  }steps=true

  loadCoords(coords: any): void {
    const url = [
      `https://api.mapbox.com/directions/v5/mapbox/driving/`,
      `${coords[0][0]},${coords[0][1]};${coords[1][0]},${coords[1][1]}`,
      `?steps=true&geometries=geojson&access_token=${this.MAP_KEY}`,
    ].join('');
    this.http.get(url).subscribe((data:any)=>{
      const route = data.routes[0].geometry.coordinates;
      this.map.addSource('route', { type: 'geojson', data: {
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'LineString',
          coordinates: route
        }
      } });

      this.map.addLayer({
        id: 'route',
        type: 'line',
        source: 'route',
        layout: {
          'line-join': 'round',
          'line-cap': 'round'
        },
        paint: { 'line-color': '#3887be', 'line-width': 5, 'line-opacity': 0.75 }
      });

      this.wayPoint = route;
      this.map.fitBounds([route[0], route[route.length - 1]],{
        padding: 50
      })
      this.socket.emit('find-driver', {points: route});

    })

    
  }


  addMarkerCustom(coords:any): void {
    console.log('----->', coords)
    const el = document.createElement('div');
    el.className = 'marker';
    if (!this.markerDriver) {
      this.markerDriver = new mapboxgl.Marker(el);
    } else {
      this.markerDriver
        .setLngLat(coords)
        .addTo(this.map);
    }
  }
}
