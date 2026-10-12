import { editions } from "../../../../news/data";
export const dynamic="force-static";
export function GET(){return Response.json({version:1,publisher:"Hisab Technologies",editions},{headers:{"Cache-Control":"public, max-age=300"}});}

