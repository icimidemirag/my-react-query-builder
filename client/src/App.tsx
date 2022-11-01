import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";
import { AgChartsReact } from "ag-charts-react";
import { AgGridReact } from "ag-grid-react";
import { ColDef, GridApi } from "ag-grid-community";
import "ag-grid-community/dist/styles/ag-grid.css";
import "ag-grid-community/dist/styles/ag-theme-alpine.css";
import { useState } from "react";
import QueryBuilder, {
  Field,
  formatQuery,
  RuleGroupType,
  RuleType,
} from "react-querybuilder";
import "./App.scss";
import combinators from "./combinators";
import CombinatorSelector from "./CombinatorSelector";
import fields from "./fields";
import getOperators from "./getOperators";
import translations from "./translations";
import { Language, Dataset } from "./types";
import ValueEditor from "./ValueEditor";
import { parseISO, addDays } from "date-fns";
import getOperatorsForUpdate from "./getOperatorsForUpdate";
import ValueEditorForBulkEdit from "./ValueEditorForBulkEdit";
// import valueProcessor from './valueProcessor';

const processChartData = (chartData: any[]) =>
  chartData.map((cd) => ({ ...cd, order_month: parseISO(cd.order_month) }));

const columnDefsMapper = (f: Field): ColDef => ({
  field: f.name,
  headerName: f.label,
});

const columnDefs = fields["sales"].map(columnDefsMapper);
const columnDefsUNL = fields["unlocode"].map(columnDefsMapper);

function App() {
  const [query, setQuery] = useState<RuleGroupType>({
    id: "root",
    combinator: "and",
    rules: [],
  });

  const [updateQuery, setUpdateQuery] = useState<RuleGroupType>({
    id: "root",
    combinator: "and",
    rules: [],
  });

  const [queryUNL, setQueryUNL] = useState<RuleGroupType>({
    id: "root",
    combinator: "and",
    rules: [],
  });

  const [language, setLanguage] = useState<Language>("en");
  const [rawData, setRawData] = useState<any[]>([]);
  const [rawDataUNL, setRawDataUNL] = useState<any[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);
  const [dataset, setDataset] = useState<Dataset>("sales");
  const [gridApi, setGridApi] = useState<GridApi>();

  const getData = async () => {
    const body = JSON.stringify(query);
    const headers = new Headers({ "Content-Type": "application/json" });

    let res: { data: any[]; chartData: any[]; error?: string } = {
      data: [],
      chartData: [],
    };

    try {
      const response = await fetch("/api/sales", {
        method: "POST",
        body,
        headers,
      });
      res = await response.json();
    } catch (err) {
      console.log(err);
    }

    if (res.error) {
      console.log(res.error);
    } else {
      setRawData(res.data);
      setChartData(res.chartData);
    }
  };

  const getDataUNL = async () => {
    const body = JSON.stringify(queryUNL);
    const headers = new Headers({ "Content-Type": "application/json" });

    let res: { data: any[]; error?: string } = {
      data: [],
    };

    try {
      const response = await fetch("/api/unlocode", {
        method: "POST",
        body,
        headers,
      });
      res = await response.json();
    } catch (err) {
      console.log(err);
    }

    if (res.error) {
      console.log(res.error);
    } else {
      setRawDataUNL(res.data);
    }
  };

  const onClickUpdate = () => {
    (updateQuery.rules as RuleType[]).forEach(r => {
      gridApi?.getSelectedNodes().forEach(n => {
        let val = n.data[r.field];

        if(r.operator === "="){
          if(
            r.field === "date" || 
            r.field === "order_date" ||
            r.field === "ship_date"
          ) {
            val = parseISO(r.value);
          }else if(
            (gridApi.getColumnDef(r.field) as any).inputType === "number"
          ){
            val = parseFloat(r.value);
          } else{
            val = r.value;
          }
        } else if (r.operator === "+"){
          val += parseFloat(r.value);
        } else if (r.operator === "-"){
          val -= parseFloat(r.value);
        } else if (r.operator === "extendBy"){
          val = addDays(val, parseFloat(r.value));
        }

        n.setDataValue(r.field, val);
      })
    })
  }

  return (
    <>
      <select
        value={language}
        onChange={(e) => setLanguage(e.target.value as Language)}
      >
        <option value="en">English</option>
        <option value="es">Spanish</option>
      </select>
      <select
        value={dataset}
        onChange={(e) => setDataset(e.target.value as Dataset)}
      >
        <option value="sales">Sales</option>
        <option value="unlocode">UN/LOCODE</option>
      </select>
      <QueryBuilder
        fields={fields[dataset]}
        onQueryChange={(q) => (dataset === "sales" ? setQuery : setQueryUNL)(q)}
        query={dataset === "sales" ? query : queryUNL}
        getOperators={getOperators}
        translations={translations[language]}
        combinators={combinators[language]}
        controlElements={{
          // addGroupAction: () => null,
          combinatorSelector: CombinatorSelector,
          valueEditor: ValueEditor,
        }}
      />
      <button onClick={dataset === "sales" ? getData : getDataUNL}>
        Get Data
      </button>
      <QueryBuilder
        fields={fields[dataset]}
        onQueryChange={q => setUpdateQuery(q)}
        query={updateQuery}
        getOperators={getOperatorsForUpdate}
        controlElements={{
          addGroupAction: () => null,
          combinatorSelector: () => null,
          valueEditor: ValueEditorForBulkEdit,
        }}
      />
      <button type="button" onClick={onClickUpdate}>Update</button>
      {/* <pre>{formatQuery(query, {format:'sql', valueProcessor})}</pre>
      <pre>{formatQuery(query, 'json')}</pre> */}
      <div className="ag-theme-alpine" style={{ height: 400, width: "100%" }}>
        <AgGridReact
          columnDefs={[
            {
              field: "selectionColumn",
              headerCheckboxSelection: true,
              checkboxSelection: true,
              width: 40,
            },
            ...(dataset === "sales" ? columnDefs : columnDefsUNL),
          ]}
          onGridReady={(gre) => setGridApi(gre.api)}
          rowData={dataset === "sales" ? rawData : rawDataUNL}
          rowSelection="multiple"
          suppressPropertyNamesCheck
        />
      </div>
      {dataset === "sales" ? (
        <AgChartsReact
          options={{
            data: processChartData(chartData),
            series: [
              {
                type: "line",
                xKey: "order_month",
                yKey: "revenue",
              },
              {
                type: "line",
                xKey: "order_month",
                yKey: "profit",
              },
            ],
            axes: [
              {
                type: "time",
                position: "bottom",
              },
              {
                type: "number",
                position: "left",
              },
            ],
          }}
        />
      ) : rawDataUNL?.length ? (
        <LoadScript
          googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY!}
          language={language}
        >
          <GoogleMap
            mapContainerStyle={{ height: "600px", width: "100%" }}
            center={{ lat: 0, lng: 0 }}
            zoom={2}
          >
            {rawDataUNL
              .filter((location) => location.latitude && location.longitude)
              .map((location) => (
                <Marker
                  key={location.id}
                  position={{
                    lat: location.latitude,
                    lng: location.longitude,
                  }}
                  title={location.name}
                />
              ))}
          </GoogleMap>
        </LoadScript>
      ) : (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: 600,
            width: "100%",
          }}
        >
          Load data to see map
        </div>
      )}
    </>
  );
}

export default App;
