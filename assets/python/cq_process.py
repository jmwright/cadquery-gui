#!/usr/bin/env python
import sys
import getopt
from cadquery import cqgi

usage = "Usage: cq_process.py --file=<cadquery_script> --outputFormat=<threeJS|etc> --parameters=<cadquery_parameters.txt>  [--outputFileName=<resulting_object_name.xxx>]"

JSON_TEMPLATE = """\
{
    "metadata" :
    {
        "formatVersion" : 3,
        "generatedBy"   : "cadquery-gui",
        "vertices"      : %(nVertices)d,
        "faces"         : %(nFaces)d,
        "normals"       : 0,
        "colors"        : 0,
        "uvs"           : 0,
        "materials"     : 1,
        "morphTargets"  : 0
    },

    "scale" : 1.0,

    "materials": [    {
    "DbgColor" : 15658734,
    "DbgIndex" : 0,
    "DbgName" : "Material",
    "colorDiffuse" : [0.6400000190734865, 0.10179081114814892, 0.126246120426746],
    "colorSpecular" : [0.5, 0.5, 0.5],
    "shading" : "Lambert",
    "specularCoef" : 50,
    "opacity" : 1.0,
    "vertexColors" : false
    }],

    "vertices": %(vertices)s,

    "morphTargets": [],

    "normals": [],

    "colors": [],

    "uvs": [[]],

    "faces": %(faces)s
}
"""

def main(argv):
    script_file = ''
    output_format = ''
    parameters = ''
    output_file_name = ''

    # Make sure that everything is good with our arguments
    try:
        opts, args = getopt.getopt(argv,"hrf:o:p:",["help", "file=","outputFormat=","parameters="])
    except getopt.GetoptError as e:
        # print (str(e))
        print("Improper command line arguments supplied.")
        print(usage)
        sys.exit(2)

    # Handling command line options
    for opt, arg in opts:
        if opt in ("-h", "--help"):
            print(usage)
            sys.exit()
        elif opt in ("-f", "--file"):
            script_file = arg
        elif opt in ("-o", "--outputFormat"):
            output_format = arg
        elif opt in ("-p", "--parameters"):
            parameters = arg
        elif opt in ("-r", "--outputFileName"):
            output_file_name = arg

    # Make sure we got the parameters and arguments we need
    if script_file == '':
        print("You must supply a CadQuery input script file name.")
    if output_format == '':
        print("You must supply an output file format.")
    if script_file == '' or output_format == '':
        print(usage)

    # Read the user's script file in and execute it
    with open(script_file, 'r') as content_file:
      user_script = content_file.read()

    build_result = cqgi.parse(user_script).build()

    # In case we have multipe objects to pass back
    jsonMeshes = []

    # Step through all of the objects returned
    for obj in build_result.results:
        # Convert the object that was returned to JSON that we can render
        s = obj.shape.val()
        tess = s.tessellate(0.1) #TODO: user provided tolerance needed

        mesher = JsonMesh() #warning: needs to be changed to remove buildTime and exportTime!!!
        #add vertices
        for vec in tess[0]:
            mesher.addVertex(vec.x, vec.y, vec.z)

        #add faces
        for f in tess[1]:
            mesher.addTriangleFace(f[0],f[1], f[2])

        jsonMeshes.append(mesher.toJson())

    # Stuff all of the JSON meshes into an array so that the environment can display all of them
    allJSONResults = '{"geometry": ['
    i = 0
    for curMesh in jsonMeshes:
      allJSONResults += curMesh

      # If there is only one object or this is the last object, we do not want a trailing comma
      if i < len(jsonMeshes) - 1:
        allJSONResults += ","

      i += 1
    allJSONResults += "],"

    allJSONResults += '"error": "' + str(build_result.exception) + '"}'

    # Passing the JSON to stdout will allow the GUI to render the object
    print(allJSONResults)

class JsonMesh(object):
    def __init__(self):

        self.vertices = []
        self.faces = []
        self.nVertices = 0
        self.nFaces = 0

    def addVertex(self,x,y,z):
        self.nVertices += 1
        self.vertices.extend([x,y,z])

    #add triangle composed of the three provided vertex indices
    def addTriangleFace(self, i,j,k):
        #first position means justa simple triangle
        self.nFaces += 1
        self.faces.extend([0,int(i),int(j),int(k)])

    """
        Get a json model from this model.
        For now we'll forget about colors, vertex normals, and all that stuff
    """
    def toJson(self):
        return JSON_TEMPLATE % {
            'vertices' : str(self.vertices),
            'faces' : str(self.faces),
            'nVertices': self.nVertices,
            'nFaces' : self.nFaces
        }

if __name__ == "__main__":
  main(sys.argv[1:])
