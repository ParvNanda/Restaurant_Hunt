import { Response, Request } from "express";
import { ApiKeyManager } from "@esri/arcgis-rest-request";
import { geocode } from "@esri/arcgis-rest-geocoding";
const cors = require('cors');
const xmlConverter = require('xml2js');
let fileReader = require('fs').readFileSync('assets.json');
const express = require('express');
const bodyParser = require('body-parser');

class Point {
  x:number 
  y:number
  constructor(x:number,y:number)
  {
      this.x=x;
      this.y=y;
  }
}

class Line {
  p1:Point
  p2:Point
  constructor(p1:Point,p2:Point)
  {
      this.p1=p1;
      this.p2=p2;
  }

};

function onLine(l1:Line, p:Point)
{
  if (p.x <= Math.max(l1.p1.x, l1.p2.x)
      && p.x >= Math.min(l1.p1.x, l1.p2.x)
      && (p.y <= Math.max(l1.p1.y, l1.p2.y)
          && p.y >= Math.min(l1.p1.y, l1.p2.y)))
      return true;

  return false;
}

function direction(a:Point, b:Point, c:Point)
{
  let val = (b.y - a.y) * (c.x - b.x)
            - (b.x - a.x) * (c.y - b.y);

  if (val == 0)

      return 0;

  else if (val < 0)

      return 2;

  return 1;
}

function isIntersect(l1:Line, l2:Line)
{ 
  let dir1 = direction(l1.p1, l1.p2, l2.p1);
  let dir2 = direction(l1.p1, l1.p2, l2.p2);
  let dir3 = direction(l2.p1, l2.p2, l1.p1);
  let dir4 = direction(l2.p1, l2.p2, l1.p2);

  if (dir1 != dir2 && dir3 != dir4)
      return true;

  if (dir1 == 0 && onLine(l1, l2.p1))
      return true;

  if (dir2 == 0 && onLine(l1, l2.p2))
      return true;

  if (dir3 == 0 && onLine(l2, l1.p1))
      return true;

  if (dir4 == 0 && onLine(l2, l1.p2))
      return true;

  return false;
}

function checkInside(poly:Array<Point>, n:number, p:Point)
{

  if (n < 3)
      return false;

  let tmp=new Point(9999, p.y);
  let exline = new Line( p, tmp );
  let count = 0;
  let i = 0;
  do {

      let side = new Line( poly[i], poly[(i + 1) % n] );
      if (isIntersect(side, exline)) {

          if (direction(side.p1, p, side.p2) == 0)
              return onLine(side, p);
          count++;
      }
      i = (i + 1) % n;
  } while (i != 0);

  return count & 1;
}

const apiKey = "AAPK5fa135bc7dc044b3a455e85a54742d35KObsBK2s--yBjiu1ZQIrC4l8GZet5jJDjrRnsT-y2munrHrf7RYtkEliZ_RDoYvh";
const authentication = ApiKeyManager.fromKey(apiKey);

const app = express();
const port = 3000;
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }))

app.use(bodyParser.json())
fileReader=(JSON.parse(fileReader))

app.get('/getOutletId', async (req:Request, res:Response) => {
  const userAddress:any = req.query.userAddress;
  console.log(userAddress)
  const geoRes = await geocode({
    address: userAddress,
  authentication
  }); 
  let isInside : Boolean|number=false
  let pmArray:Array<Point>=[]
  let outletName : string = "not found"
  for (let i=1; i< fileReader.kml.Document.Placemark.length; i+=2){
    for(let coord of fileReader.kml.Document.Placemark[i].Polygon.outerBoundaryIs.LinearRing.coordinates){
      let pCord = coord.split(',')
      let newPoint = new Point(pCord[0],pCord[1])
      pmArray.push(newPoint)  
    }
    isInside = checkInside(pmArray,pmArray.length,new Point(geoRes.candidates[0].location.x,geoRes.candidates[0].location.y))
    console.log(geoRes.candidates[0].location.x,geoRes.candidates[0].location.y)
    if(isInside==1){
      outletName=fileReader.kml.Document.Placemark[i].name
      break;
    }
  }
  console.log(outletName)
  res.send(outletName)
});
app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});