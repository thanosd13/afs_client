import React, { useEffect, useState } from "react";
import { CCard, CCardBody, CCol, CCardHeader, CRow } from "@coreui/react";
import {
  CChartBar,
  CChartLine,
  CChartDoughnut,
  CChartPie,
} from "@coreui/react-chartjs";
import UserService from "../../services/UserService";

const Charts = () => {
  const [incomeData, setIncomeData] = useState({ labels: [], datasets: [] });
  const [expenseData, setExpenseData] = useState({ labels: [], datasets: [] });

  useEffect(() => {
    const processData = (data, currentYear) => {
      if (!Array.isArray(data)) {
        data = [data];
      }

      const aggregatedData = {};

      // Initialize all months with 0 values for current and last year
      for (let month = 0; month < 12; month++) {
        const currentYearLabel = `${String(month + 1).padStart(2, "0")}/${currentYear.getFullYear()}`;
        const lastYearLabel = `${String(month + 1).padStart(2, "0")}/${currentYear.getFullYear() - 1}`;
        aggregatedData[currentYearLabel] = { currentYear: 0, lastYear: 0 };
        aggregatedData[lastYearLabel] = { currentYear: 0, lastYear: 0 };
      }

      data.forEach((item) => {
        const date = new Date(item.issueDate);
        const month = date.getMonth();
        const year = date.getFullYear();

        if (
          year === currentYear.getFullYear() ||
          year === currentYear.getFullYear() - 1
        ) {
          const label = `${String(month + 1).padStart(2, "0")}/${year}`;

          if (year === currentYear.getFullYear()) {
            aggregatedData[label].currentYear += parseFloat(item.grossValue);
          } else if (year === currentYear.getFullYear() - 1) {
            aggregatedData[label].lastYear += parseFloat(item.grossValue);
          }
        }
      });

      const labels = Object.keys(aggregatedData).sort((a, b) => {
        const [monthA, yearA] = a.split("/").map(Number);
        const [monthB, yearB] = b.split("/").map(Number);
        return new Date(yearA, monthA - 1) - new Date(yearB, monthB - 1);
      });
      const currentYearData = labels
        .filter((label) => label.endsWith(currentYear.getFullYear().toString()))
        .map((label) => aggregatedData[label].currentYear);
      const lastYearData = labels
        .filter((label) =>
          label.endsWith((currentYear.getFullYear() - 1).toString())
        )
        .map((label) => aggregatedData[label].lastYear);

      return {
        labels: labels.filter((label) =>
          label.endsWith(currentYear.getFullYear().toString())
        ),
        datasets: [
          { label: "Τρέχον έτος", data: currentYearData },
          { label: "Προηγούμενο έτος", data: lastYearData },
        ],
      };
    };

    const requestIncome = async () => {
      try {
        const id = localStorage.getItem("id");
        const response = await UserService.requestIncome(id);
        if (response.status === 200) {
          const currentYear = new Date();
          const processedData = processData(response.data.data, currentYear);
          setIncomeData(processedData);
        }
      } catch (error) {
        console.log(error);
      }
    };

    const requestExpenses = async () => {
      try {
        const id = localStorage.getItem("id");
        const response = await UserService.requestExpenses(id);
        if (response.status === 200) {
          const currentYear = new Date();
          const processedData = processData(response.data.data, currentYear);
          setExpenseData(processedData);
        }
      } catch (error) {
        console.log(error);
      }
    };

    requestIncome();
    requestExpenses();
  }, []);

  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader>Έσοδα</CCardHeader>
          <CCardBody>
            <div style={{ overflowX: "auto" }}>
              <CChartBar
                data={{
                  labels: incomeData.labels,
                  datasets: incomeData.datasets.map((dataset, index) => ({
                    ...dataset,
                    backgroundColor: index === 0 ? "#f87979" : "#36A2EB",
                  })),
                }}
                labels="dates"
              />
            </div>
          </CCardBody>
        </CCard>
      </CCol>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader>Έξοδα</CCardHeader>
          <CCardBody>
            <div style={{ overflowX: "auto" }}>
              <CChartBar
                data={{
                  labels: expenseData.labels,
                  datasets: expenseData.datasets.map((dataset, index) => ({
                    ...dataset,
                    backgroundColor: index === 0 ? "#f87979" : "#36A2EB",
                  })),
                }}
                labels="dates"
              />
            </div>
          </CCardBody>
        </CCard>
      </CCol>
      {/* <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader>Έξοδα</CCardHeader>
          <CCardBody>
            <div style={{ overflowX: "auto" }}>
              <CChartLine
                data={{
                  labels: expenseData.labels,
                  datasets: expenseData.datasets.map((dataset, index) => ({
                    ...dataset,
                    backgroundColor:
                      index === 0
                        ? "rgba(220, 220, 220, 0.2)"
                        : "rgba(75, 192, 192, 0.2)",
                    borderColor:
                      index === 0
                        ? "rgba(220, 220, 220, 1)"
                        : "rgba(75, 192, 192, 1)",
                    pointBackgroundColor:
                      index === 0
                        ? "rgba(220, 220, 220, 1)"
                        : "rgba(75, 192, 192, 1)",
                  })),
                }}
              />
            </div>
          </CCardBody>
        </CCard>
      </CCol>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader>Έξοδα</CCardHeader>
          <CCardBody>
            <div style={{ overflowX: "auto" }}>
              <CChartDoughnut
                data={{
                  labels: expenseData.labels,
                  datasets: expenseData.datasets.map((dataset, index) => ({
                    ...dataset,
                    backgroundColor:
                      index === 0
                        ? [
                            "#41B883",
                            "#E46651",
                            "#00D8FF",
                            "#DD1B16",
                            "#FF6384",
                            "#36A2EB",
                            "#FFCE56",
                            "#4BC0C0",
                            "#9966FF",
                            "#FF9F40",
                          ]
                        : [
                            "#FFCE56",
                            "#4BC0C0",
                            "#9966FF",
                            "#FF9F40",
                            "#FF6384",
                            "#36A2EB",
                            "#FFCE56",
                            "#4BC0C0",
                            "#9966FF",
                            "#FF9F40",
                          ],
                  })),
                }}
              />
            </div>
          </CCardBody>
        </CCard>
      </CCol>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader>Έξοδα</CCardHeader>
          <CCardBody>
            <div style={{ overflowX: "auto" }}>
              <CChartPie
                data={{
                  labels: expenseData.labels,
                  datasets: expenseData.datasets.map((dataset, index) => ({
                    ...dataset,
                    backgroundColor:
                      index === 0
                        ? [
                            "#FF6384",
                            "#36A2EB",
                            "#FFCE56",
                            "#4BC0C0",
                            "#9966FF",
                            "#FF9F40",
                          ]
                        : [
                            "#FFCE56",
                            "#4BC0C0",
                            "#9966FF",
                            "#FF9F40",
                            "#FF6384",
                            "#36A2EB",
                          ],
                  })),
                }}
              />
            </div>
          </CCardBody>
        </CCard>
      </CCol> */}
    </CRow>
  );
};

export default Charts;
