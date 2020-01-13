import React, { Component } from "react";
import cornerstone from "cornerstone-core";
import cornerstoneTools from "cornerstone-tools";
import {
  getImageIds,
  getWadoImagePath,
  getSegmentation
} from "../../services/seriesServices";
import { connect } from "react-redux";
import { Redirect } from "react-router";
import { withRouter } from "react-router-dom";
import "./flex.css";
import "./viewport.css";
import { changeActivePort, updateImageId } from "../annotationsList/action";
import ContextMenu from "./contextMenu";
import { MenuProvider } from "react-contexify";
import CornerstoneViewport from "react-cornerstone-viewport";
import OHIFSegmentationExtension from "../../ohif-segmentation-plugin";
import { freehand } from "./Freehand";
import { line } from "./Line";
import { probe } from "./Probe";
import { circle } from "./Circle";
import RightsideBar from "../RightsideBar/RightsideBar";
import * as dcmjs from "dcmjs";
const mode = sessionStorage.getItem("mode");
const wadoUrl = sessionStorage.getItem("wadoUrl");

const tools = [
  { name: "Wwwc", modeOptions: { mouseButtonMasks: [1] }, mode: "active" },
  { name: "Pan", modeOptions: { mouseButtonMasks: [1] } },
  {
    name: "Zoom",
    configuration: {
      minScale: 0.3,
      maxScale: 25,
      preventZoomOutsideImage: true
    },
    modeOptions: { mouseButtonMasks: [1, 2] }
  },
  { name: "Probe", modeOptions: { mouseButtonMasks: [1] } },
  { name: "Length", modeOptions: { mouseButtonMasks: [1] }, mode: "enabled" },
  // {
  //   name: "EllipticalRoi",
  //   configuration: {
  //     showMinMax: true
  //   }
  // },
  // {
  //   name: "RectangleRoi",
  //   configuration: {
  //     showMinMax: true
  //   }
  // },
  {
    name: "CircleRoi",
    configuration: {
      showMinMax: true
    },
    modeOptions: { mouseButtonMasks: [1] },
    mode: "active"
  },
  { name: "Angle" },
  { name: "Rotate" },
  { name: "WwwcRegion" },
  {
    name: "FreehandRoi",
    moreOptions: { mouseButtonMasks: [1] },
    mode: "active"
  },
  { name: "FreehandRoiSculptor", modeOptions: { mouseButtonMasks: [1] } },
  { name: "FreehandRoi3DTool", moreOptions: { mouseButtonMasks: [1] } },
  { name: "FreehandRoiSculptorTool", modeOptions: { mouseButtonMasks: [1] } },
  { name: "Eraser" },
  {
    name: "Bidirectional",
    modeOptions: { mouseButtonMasks: [1] },
    mode: "active"
  },
  { name: "Brush3DTool" },
  { name: "StackScroll", modeOptions: { mouseButtonMasks: [1] } },
  { name: "PanMultiTouch" },
  { name: "ZoomTouchPinch" },
  { name: "StackScrollMouseWheel", mode: "active" },
  { name: "StackScrollMultiTouch" },
  { name: "FreehandScissors", modeOptions: { mouseButtonMasks: [1] } },
  { name: "RectangleScissors", modeOptions: { mouseButtonMasks: [1] } },
  { name: "CircleScissors", modeOptions: { mouseButtonMasks: [1] } },
  { name: "CorrectionScissors", modeOptions: { mouseButtonMasks: [1] } }
];

const mapStateToProps = state => {
  return {
    series: state.annotationsListReducer.openSeries,
    loading: state.annotationsListReducer.loading,
    activePort: state.annotationsListReducer.activePort,
    aimList: state.annotationsListReducer.aimsList
  };
};

class DisplayView extends Component {
  constructor(props) {
    super(props);
    this.state = {
      width: "100%",
      height: "calc(100% - 60px)",
      hiding: false,
      data: [],
      isLoading: true,
      selectedAim: undefined,
      refs: props.refs,
      showAnnDetails: true,
      hasSegmentation: false
    };
  }

  componentDidMount() {
    this.getViewports();
    this.getData();
    window.addEventListener("markupSelected", this.handleMarkupSelected);
    window.addEventListener("markupCreated", this.handleMarkupCreated);
  }

  async componentDidUpdate(prevProps) {
    if (
      prevProps.series !== this.props.series &&
      prevProps.loading === true &&
      this.props.loading === false
    ) {
      await this.setState({ isLoading: true });
      this.getViewports();
      this.getData();
    }
  }

  componentWillUnmount() {
    window.removeEventListener("markupSelected", this.handleMarkupSelected);
    window.removeEventListener("markupCreated", this.handleMarkupCreated);
  }

  // componentDidUpdate = async prevProps => {
  //   if (
  //     (this.props.loading !== prevProps.loading && !this.props.loading) ||
  //     this.props.series !== prevProps.series
  //   ) {
  //     await this.setState({ isLoading: true });

  //     this.getViewports();
  //     this.getData();
  //   }
  // };

  sleep = ms => {
    return new Promise(resolve => setTimeout(resolve, ms));
  };

  getData() {
    // clear the toolState they will be rendered again on next load
    cornerstoneTools.globalImageIdSpecificToolStateManager.restoreToolState({});

    const { series } = this.props;
    var promises = [];
    for (let i = 0; i < series.length; i++) {
      const promise = this.getImageStack(series[i], i);
      promises.push(promise);
    }
    Promise.all(promises).then(res => {
      this.setState({ data: res, isLoading: false });
    });

    series.forEach(serie => {
      if (serie.imageAnnotations)
        this.parseAims(serie.imageAnnotations, serie.seriesUID, serie.studyUID);
    });
  }

  async getImages(serie) {
    const { data: urls } = await getImageIds(serie); //get the Wado image ids for this series
    return urls;
  }

  getImageStack = async (serie, index) => {
    let stack = {};
    let cornerstoneImageIds = [];
    const imageUrls = await this.getImages(serie);
    imageUrls.map(url => {
      const baseUrl = wadoUrl + url.lossyImage;
      if (url.multiFrameImage === true) {
        for (var i = 0; i < url.numberOfFrames; i++) {
          let multiFrameUrl =
            mode !== "lite" ? baseUrl + "/frames/" + i : baseUrl;
          cornerstoneImageIds.push(multiFrameUrl);
        }
      } else {
        let singleFrameUrl = mode !== "lite" ? baseUrl : baseUrl;
        cornerstoneImageIds.push(singleFrameUrl);
      }
    });
    //to jump to the same image after aim save
    let imageIndex;
    if (
      this.state.data.length &&
      this.state.data[index].stack.currentImageIdIndex
    )
      imageIndex = this.state.data[index].stack.currentImageIdIndex;
    else imageIndex = 0;

    if (serie.aimID) {
      console.log("Serie", serie);
      imageIndex = this.getImageIndex(serie, cornerstoneImageIds);
      // TODO: dispatch an event to clear aimId from the serie not to jump to that image again and again
    }

    stack.currentImageIdIndex = parseInt(imageIndex, 10);
    stack.imageIds = [...cornerstoneImageIds];
    return { stack };
  };

  getImageIndex = (serie, cornerstoneImageIds) => {
    let { aimID, imageAnnotations } = serie;
    const { series, activePort } = this.props;
    if (imageAnnotations) {
      for (let [key, values] of Object.entries(imageAnnotations)) {
        for (let value of values) {
          const { studyUID, seriesUID } = series[activePort];
          if (value.aimUid === aimID) {
            const cornerstoneImageId = getWadoImagePath(
              studyUID,
              seriesUID,
              key
            );
            const ret = this.getImageIndexFromImageId(
              cornerstoneImageIds,
              cornerstoneImageId
            );
            return ret;
          }
        }
      }
    }
    return 0;
  };

  getImageIndexFromImageId = (cornerstoneImageIds, cornerstoneImageId) => {
    for (let [key, value] of Object.entries(cornerstoneImageIds)) {
      if (value == cornerstoneImageId) return key;
    }
    return 0;
  };

  getViewports = () => {
    let numSeries = this.props.series.length;
    let numCols = numSeries % 3;
    if (numSeries > 3) {
      this.setState({ height: "calc((100% - 60px)/2)" });
      this.setState({ width: "33%" });
      return;
    }
    if (numCols === 1) {
      this.setState({ width: "100%" });
    } else if (numCols === 2) this.setState({ width: "50%" });
    else this.setState({ width: "33%", height: "calc(100% - 60px)" });
  };

  createRefs() {
    this.state.series.map(() =>
      this.props.dispatch(this.createViewport(React.createRef()))
    );
  }

  createViewport(viewportRef) {
    return {
      type: "CREATE_VIEWPORT",
      payload: viewportRef
    };
  }

  defaultSelectVP(id) {
    return {
      type: "SELECT_VIEWPORT",
      payload: id
    };
  }

  hideShow = current => {
    const elements = document.getElementsByClassName("viewportContainer");
    if (this.state.hiding === false) {
      for (var i = 0; i < elements.length; i++) {
        if (i != current) elements[i].style.display = "none";
      }
      this.setState({ height: "calc(100% - 60px)", width: "100%" });
    } else {
      this.getViewports();
      for (var i = 0; i < elements.length; i++) {
        elements[i].style.display = "inline-block";
      }
    }
    this.setState({ hiding: !this.state.hiding }, () =>
      window.dispatchEvent(new Event("resize"))
    );
  };

  // TODO: Can this be done without checking the tools of interest?
  measurementCompleted = (event, action) => {
    const { toolName, toolType } = event.detail;

    const toolsOfInterest = [
      "Probe",
      "Length",
      "CircleRoi",
      "FreehandRoi3DTool"
    ];
    if (toolsOfInterest.includes(toolName) || toolType === "Bidirectional") {
      this.setState({ showAimEditor: true, selectedAim: undefined });
    }
  };

  handleMarkupSelected = event => {
    if (
      this.props.aimList[this.props.series[this.props.activePort].seriesUID][
        event.detail
      ]
    ) {
      const aimJson = this.props.aimList[
        this.props.series[this.props.activePort].seriesUID
      ][event.detail].json;
      const markupTypes = this.getMarkupTypesForAim(event.detail);
      aimJson["markupType"] = [...markupTypes];
      if (this.state.showAimEditor && this.state.selectedAim !== aimJson)
        this.setState({ showAimEditor: false });
      this.setState({ showAimEditor: true, selectedAim: aimJson });
    }
  };

  handleMarkupCreated = event => {
    const { detail } = event;
    this.setState({ showAimEditor: true, selectedAim: undefined });
    if (detail === "brush") this.setState({ hasSegmentation: true });
  };

  setActive = i => {
    this.props.dispatch(changeActivePort(i));
    if (this.props.activePort !== i) {
      this.setState({ activePort: i });
    }
  };

  parseAims = (aimList, seriesUid, studyUid) => {
    Object.entries(aimList).forEach(([key, values], i) => {
      values.forEach(value => {
        const { markupType, aimUid } = value;
        if (markupType === "DicomSegmentationEntity")
          this.getSegmentationData(seriesUid, studyUid, aimUid, i);
        const color = this.getColorOfMarkup(value.aimUid, seriesUid);
        this.renderMarkup(key, value, color, seriesUid, studyUid);
      });
    });
  };

  getSegmentationData = (seriesUID, studyUID, aimId, i) => {
    const { aimList } = this.props;

    const segmentationEntity =
      aimList[seriesUID][aimId].json.segmentationEntityCollection
        .SegmentationEntity[0];

    const { seriesInstanceUid, sopInstanceUid } = segmentationEntity;

    const pathVariables = { studyUID, seriesUID: seriesInstanceUid.root };

    getSegmentation(pathVariables, sopInstanceUid.root).then(segData => {
      // segData.arrayBuffer().then(segBuffer => {
      console.log("Seg Data is", segData.data);
      // this.renderSegmentation(segData.data, i);
      // });
    });
  };

  renderSegmentation = (arrayBuffer, i) => {
    const { element } = cornerstone.getEnabledElements()[this.props.activePort];

    const stackToolState = cornerstoneTools.getToolState(element, "stack");
    console.log("Stack toolstate", stackToolState);
    const imageIds = stackToolState.data[0].imageIds;
    console.log(
      "Tool state genrated",
      dcmjs.adapters.Cornerstone.Segmentation.generateToolState(
        imageIds,
        arrayBuffer,
        cornerstone.metaData
      )
    );
    const {
      labelmapBuffer,
      segMetadata,
      segmentsOnFrame
    } = dcmjs.adapters.Cornerstone.Segmentation.generateToolState(
      imageIds,
      arrayBuffer,
      cornerstone.metaData
    );
    const { setters, state } = cornerstoneTools.getModule("segmentation");
    setters.labelmap3DByFirstImageId(
      imageIds[0],
      labelmapBuffer,
      i,
      segMetadata,
      imageIds.length,
      segmentsOnFrame
    );
  };

  getColorOfMarkup = (aimUid, seriesUid) => {
    return this.props.aimList[seriesUid][aimUid].color.button.background;
  };

  renderMarkup = (imageId, markup, color, seriesUid, studyUid) => {
    const type = markup.markupType;
    switch (type) {
      case "TwoDimensionPolyline":
        this.renderPolygon(imageId, markup, color, seriesUid, studyUid);
        break;
      case "TwoDimensionMultiPoint":
        this.renderLine(imageId, markup, color, seriesUid, studyUid);
        break;
      case "TwoDimensionCircle":
        this.renderCircle(imageId, markup, color, seriesUid, studyUid);
        break;
      case "TwoDimensionPoint":
        this.renderPoint(imageId, markup, color, seriesUid, studyUid);
        break;
      default:
        return;
    }
  };

  checkNCreateToolForImage = (toolState, imageId, tool) => {
    if (!toolState.hasOwnProperty(imageId))
      toolState[imageId] = { [tool]: { data: [] } };
    else if (!toolState[imageId].hasOwnProperty(tool))
      toolState[imageId] = { ...toolState[imageId], [tool]: { data: [] } };
  };

  renderLine = (imageId, markup, color, seriesUid, studyUid) => {
    const imgId = getWadoImagePath(studyUid, seriesUid, imageId);
    const data = JSON.parse(JSON.stringify(line));
    data.color = color;
    data.aimId = markup.aimUid;
    this.createLinePoints(data, markup.coordinates);
    const currentState = cornerstoneTools.globalImageIdSpecificToolStateManager.saveToolState();
    this.checkNCreateToolForImage(currentState, imgId, "Length");
    currentState[imgId]["Length"].data.push(data);
    cornerstoneTools.globalImageIdSpecificToolStateManager.restoreToolState(
      currentState
    );
    const csTools = cornerstoneTools.globalImageIdSpecificToolStateManager;
  };

  createLinePoints = (data, points) => {
    data.handles.start.x = points[0].x.value;
    data.handles.start.y = points[0].y.value;
    data.handles.end.x = points[1].x.value;
    data.handles.end.y = points[1].y.value;
  };

  renderPolygon = (imageId, markup, color, seriesUid, studyUid) => {
    const imgId = getWadoImagePath(studyUid, seriesUid, imageId);
    const data = JSON.parse(JSON.stringify(freehand));
    data.color = color;
    data.aimId = markup.aimUid;
    this.createPolygonPoints(data, markup.coordinates);
    const currentState = cornerstoneTools.globalImageIdSpecificToolStateManager.saveToolState();
    this.checkNCreateToolForImage(currentState, imgId, "FreehandRoi");
    currentState[imgId]["FreehandRoi"].data.push(data);
    cornerstoneTools.globalImageIdSpecificToolStateManager.restoreToolState(
      currentState
    );
  };

  createPolygonPoints = (data, points) => {
    const freehandPoints = [];
    const modulo = points.length;
    points.forEach((point, index) => {
      const linesIndex = (index + 1) % modulo;
      const freehandPoint = {};
      freehandPoint.x = point.x.value;
      freehandPoint.y = point.y.value;
      freehandPoint.highlight = true;
      freehandPoint.active = true;
      freehandPoint.lines = [
        { x: points[linesIndex].x.value, y: points[linesIndex].y.value }
      ];
      freehandPoints.push(freehandPoint);
    });
    data.handles.points = [...freehandPoints];
  };

  renderPoint = (imageId, markup, color, seriesUid, studyUid) => {
    const imgId = getWadoImagePath(studyUid, seriesUid, imageId);
    const data = JSON.parse(JSON.stringify(probe));
    data.color = color;
    data.aimId = markup.aimUid;
    data.handles.end.x = markup.coordinates.x.value;
    data.handles.end.y = markup.coordinates.y.value;
    const currentState = cornerstoneTools.globalImageIdSpecificToolStateManager.saveToolState();
    this.checkNCreateToolForImage(currentState, imgId, "Probe");
    currentState[imgId]["Probe"].data.push(data);
    cornerstoneTools.globalImageIdSpecificToolStateManager.restoreToolState(
      currentState
    );
  };

  renderCircle = (imageId, markup, color, seriesUid, studyUid) => {
    const imgId = getWadoImagePath(studyUid, seriesUid, imageId);
    const data = JSON.parse(JSON.stringify(circle));
    data.color = color;
    data.aimId = markup.aimUid;
    data.handles.start.x = markup.coordinates[0].x.value;
    data.handles.start.y = markup.coordinates[0].y.value;
    data.handles.end.x = markup.coordinates[1].x.value;
    data.handles.end.y = markup.coordinates[1].y.value;
    const currentState = cornerstoneTools.globalImageIdSpecificToolStateManager.saveToolState();
    this.checkNCreateToolForImage(currentState, imgId, "CircleRoi");
    currentState[imgId]["CircleRoi"].data.push(data);
    cornerstoneTools.globalImageIdSpecificToolStateManager.restoreToolState(
      currentState
    );
  };

  closeAimEditor = () => {
    this.setState({ showAimEditor: false, selectedAim: undefined });
  };

  handleHideAnnotations = () => {
    this.setState({ showAnnDetails: false });
  };

  getMarkupTypesForAim = aimUid => {
    let markupTypes = [];
    const imageAnnotations = this.props.series[this.props.activePort]
      .imageAnnotations;
    Object.entries(imageAnnotations).forEach(([key, values]) => {
      values.forEach(value => {
        if (value.aimUid === aimUid) markupTypes.push(value.markupType);
      });
    });
    return markupTypes;
  };
  newImage = event => {
    const { activePort } = this.props;
    const tempData = this.state.data;
    const activeElement = cornerstone.getEnabledElements()[activePort];
    const { data } = cornerstoneTools.getToolState(
      activeElement.element,
      "stack"
    );
    tempData[activePort].stack = data[0];
    // set the state to preserve the imageId
    this.setState({ data: tempData });
    // dispatch to write the newImageId to store
    this.props.dispatch(updateImageId(event));
  };

  onAnnotate = () => {
    this.setState({ showAimEditor: true });
  };

  render() {
    return !Object.entries(this.props.series).length ? (
      <Redirect to="/search" />
    ) : (
      <React.Fragment>
        <RightsideBar
          showAimEditor={this.state.showAimEditor}
          aimId={this.state.selectedAim}
          onCancel={this.closeAimEditor}
          hasSegmentation={this.state.hasSegmentation}
        >
          {!this.state.isLoading &&
            Object.entries(this.props.series).length &&
            this.state.data.map((data, i) => (
              <div
                className={
                  "viewportContainer" +
                  (this.props.activePort == i ? " selected" : "")
                }
                key={i}
                id={"viewportContainer" + i}
                style={{
                  width: this.state.width,
                  height: this.state.height,
                  padding: "2px",
                  display: "inline-block"
                }}
                onDoubleClick={() => this.hideShow(i)}
              >
                <MenuProvider
                  id="menu_id"
                  style={{
                    width: "100%",
                    height: "100%",
                    display: "inline-block"
                  }}
                >
                  <CornerstoneViewport
                    key={i}
                    imageIds={data.stack.imageIds}
                    imageIdIndex={data.stack.currentImageIdIndex}
                    viewportIndex={i}
                    tools={tools}
                    eventListeners={[
                      {
                        target: "element",
                        eventName: "cornerstonetoolsmeasurementcompleted",
                        handler: this.measurementCompleted
                      },
                      {
                        target: "element",
                        eventName: "cornerstonenewimage",
                        handler: this.newImage
                      }
                    ]}
                    setViewportActive={() => this.setActive(i)}
                    isStackPrefetchEnabled={true}
                  />
                </MenuProvider>
              </div>
            ))}
          <ContextMenu onAnnotate={this.onAnnotate} />
        </RightsideBar>
      </React.Fragment>
    );
    // </div>
  }
}

export default withRouter(connect(mapStateToProps)(DisplayView));
