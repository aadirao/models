import bpy,json,math
from pathlib import Path
from mathutils import Vector
from mathutils.bvhtree import BVHTree
s=bpy.data.scenes['TRACE | Illustrative assembly'];bpy.context.window.scene=s
deps=bpy.context.evaluated_depsgraph_get();clearances=[]
for obj in s.objects:
 if obj.name.startswith('Continuous formed tracer tail'):
  evaluated=obj.evaluated_get(deps);data=evaluated.to_mesh()
  for v in data.vertices:
   p=obj.matrix_world@v.co
   if .741<=abs(p.x)<=.769:clearances.append(math.hypot(p.y,p.z-.85)-.136)
  evaluated.to_mesh_clear()
assert clearances and min(clearances)>.001
elbow_clearances=[]
for obj in s.objects:
 if obj.name.startswith('Tracer | jacket outlet jumper'):
  e=obj.evaluated_get(deps);m=e.to_mesh()
  for vert in m.vertices:
   p=obj.matrix_world@vert.co
   if 1.35<=p.x<=1.475:elbow_clearances.append(math.hypot(p.y,p.z-.85)-.08415)
  e.to_mesh_clear()
assert elbow_clearances and min(elbow_clearances)>-.0001, min(elbow_clearances)
enhancers=[o for o in s.objects if o.name.startswith('Enhancer ')];assert len(enhancers)==3
for o in enhancers:
 zz=[v.co.z for v in o.data.vertices];assert abs(max(zz)-min(zz)-.0508)<1e-5
 assert min(math.hypot(v.co.y,v.co.z-.85) for v in o.data.vertices)>.08415
def tree(o,offset=0):
 e=o.evaluated_get(deps);m=e.to_mesh();v=[o.matrix_world@q.co+Vector((0,offset,0)) for q in m.vertices];f=[tuple(p.vertices) for p in m.polygons];t=BVHTree.FromPolygons(v,f);e.to_mesh_clear();return t
valves=[o for o in s.objects if o.get('layer')=='valve' and o.type=='MESH']
halves=[o for o in s.objects if o.name.startswith('Valve jacket |')]
assert len(halves)==2
vt=[(o.name,tree(o)) for o in valves];intersections=[]
for half in halves:
 for d in [0,.01,.05,.15,.34]:
  t=tree(half,(-1 if half['piece']==0 else 1)*d)
  for name,v in vt:
   if t.overlap(v):intersections.append({'half':half.name,'valve':name,'approach_offset':d})
checks={'three_enhancers':True,'documented_width':True,'enhancer_pipe_clearance':True,'tracer_flange_clearance':True,'static_native_model':s.frame_start==s.frame_end==245,'no_missing_linked_assets':not bpy.data.libraries,'six_installed_bands':sum(o.name.startswith('Installed band') for o in s.objects)==6,'three_insulation_sections':sum(o.name.startswith('Insulation split') for o in s.objects)==3,'reference_valve_and_jacket':len(halves)==2 and len(valves)>50,'jacket_body_approach_no_surface_intersections':not intersections,'system_route_present':any(o.get('layer')=='system' for o in s.objects)}
checks['tracer_return_clears_elbow_inlet']=min(elbow_clearances)>-.0001
out={'passed':all(checks.values()),'checks':checks,'intersection_details':intersections,'minimum_tracer_elbow_clearance_mm':min(elbow_clearances)*1000,'minimum_tracer_flange_clearance_mm':min(clearances)*1000,'objects':len(s.objects),'blender':bpy.app.version_string,'limits':'Sampled triangle intersection checks on jacket body approaches and analytic fit checks; not a complete contact or flexible-body dynamics solution'}
(Path(bpy.data.filepath).parent/'geometry-verification.json').write_text(json.dumps(out,indent=2));print('V4_GEOMETRY_AUDIT',json.dumps(out))
assert out['passed'],str(intersections)
