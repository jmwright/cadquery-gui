# cadquery-gui (cqg)
An Electron-based CAD GUI built for [CadQuery](https://github.com/dcowden/cadquery/blob/master/README.md).

***Note: This software is in alpha and is seeing breaking changes frequently. It is not ready for production use.***

![User Interface Overview](docs/images/gui.png)

## General Prerequisites
1. Install npm

## CadQuery 1.0 Prerequisites
If you are wanting to use the FreeCAD based version of CadQuery (version 1.x), follow these prerequisite installation instructions.
1. Install FreeCAD (>=0.16)
2. Install the latest version of CadQuery from the GitHub repo.
```
pip install git+https://github.com/dcowden/cadquery.git
```

## CadQuery 2.0 Prerequisites
If you are wanting to use the PythonOCC based version of CadQuery (version 2.x), follow these prerequisite installation instructions.
1. Create a cadquery Anaconda environment `conda create --name cadquery`
2. Activate the conda environment `conda activate cadquery`
3. Follow the instructions [here](https://github.com/CadQuery/cadquery#standalone) to install the prerequisites.

## Install The Latest Development Version of cadquery-gui
The latest version can be cloned directly from this GitHub repo.
```
git clone https://github.com/jmwright/cadquery-gui.git
cd cadquery-gui/
npm install
```

## Run The Latest Development Version of cadquery-gui
```
npm start
```
