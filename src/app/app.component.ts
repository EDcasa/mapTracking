import { Component, ElementRef, OnInit, Renderer2, ViewChild } from '@angular/core';
import { MapCustomService } from './service/map-custom.service';
import { Socket } from 'ngx-socket-io';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  
  @ViewChild('asGeoCoder') asGeoCoder!: ElementRef;
  /**
   *
   */
  wayPoints:any = { start: null, end: null };
  modeInput = 'start';
  constructor(
    private mapCustomservice:MapCustomService,
    private renderer2: Renderer2,
    private socket: Socket
  ) {
    
  }
  ngOnInit(): void {
    this.mapCustomservice.buildMap().then(({map, geocoder})=>{
      this.renderer2.appendChild(this.asGeoCoder.nativeElement, geocoder.onAdd(map));
    }).catch((error)=>{
      console.log(error);
    })
    this.mapCustomservice.cbAddress.subscribe(
      {
        next:(getpoint:any)=>{
          console.log(getpoint);
          
          if(this.modeInput === 'start'){
            this.wayPoints.start = getpoint;
          }

          if(this.modeInput === 'end'){
            this.wayPoints.end = getpoint;
          }
          console.log(this.wayPoints);
          
        }})

        //send positions
        this.socket.fromEvent('position').subscribe(
          {
            next:(coords:any)=>{
              const coordsObj = {
                lat: coords[1],
                lng: coords[0]
              }
              this.mapCustomservice.addMarkerCustom(coordsObj);
            }
          })

  }

  draweRoute(){
    const coords = [
      this.wayPoints.start.center,
      this.wayPoints.end.center
    ]
    this.mapCustomservice.loadCoords(coords);
  }

  changeMode(mode:string){
    this.modeInput = mode;
  }
}
