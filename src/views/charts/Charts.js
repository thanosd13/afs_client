import React, { useEffect, useState } from "react";
import { CCard, CCardBody, CCol, CCardHeader, CRow } from "@coreui/react";
import {
  CChartBar,
  CChartDoughnut,
  CChartLine,
  CChartPie,
  CChartPolarArea,
  CChartRadar,
} from "@coreui/react-chartjs";
import UserService from "../../services/UserService";

const Charts = () => {
  const [incomeData, setIncomeData] = useState({ labels: [], grossValues: [] });
  const [expenseData, setExpenseData] = useState({
    labels: [],
    grossValues: [],
  });

  useEffect(() => {
    const requestIncome = async () => {
      try {
        const id = localStorage.getItem("id");
        const response = await UserService.requestIncome(id);
        if (response.status === 200) {
          const data = response.data.data;
          const aggregatedData = data.reduce((acc, item) => {
            const date = item.issueDate;
            const grossValue = parseFloat(item.grossValue);

            if (acc[date]) {
              acc[date] += grossValue;
            } else {
              acc[date] = grossValue;
            }
            return acc;
          }, {});

          const sortedDates = Object.keys(aggregatedData).sort(
            (a, b) => new Date(a) - new Date(b)
          );
          const grossValues = sortedDates.map((date) => aggregatedData[date]);

          setIncomeData({ labels: sortedDates, grossValues });
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
          const data = response.data.data;
          const aggregatedData = data.reduce((acc, item) => {
            const date = item.issueDate;
            const grossValue = parseFloat(item.grossValue);

            if (acc[date]) {
              acc[date] += grossValue;
            } else {
              acc[date] = grossValue;
            }
            return acc;
          }, {});

          const sortedDates = Object.keys(aggregatedData).sort(
            (a, b) => new Date(a) - new Date(b)
          );
          const grossValues = sortedDates.map((date) => aggregatedData[date]);

          setExpenseData({ labels: sortedDates, grossValues });
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
      <CCol xs={6}>
        <CCard className="mb-4">
          <CCardHeader>Έσοδα</CCardHeader>
          <CCardBody>
            <CChartBar
              data={{
                labels: incomeData.labels,
                datasets: [
                  {
                    label: "Έσοδα ημέρας",
                    backgroundColor: "#f87979",
                    data: incomeData.grossValues,
                  },
                ],
              }}
              labels="dates"
            />
          </CCardBody>
        </CCard>
      </CCol>
      <CCol xs={6}>
        <CCard className="mb-4">
          <CCardHeader>Έσοδα</CCardHeader>
          <CCardBody>
            <CChartLine
              data={{
                labels: incomeData.labels,
                datasets: [
                  {
                    label: "Έσοδα ημέρας",
                    backgroundColor: "rgba(220, 220, 220, 0.2)",
                    borderColor: "rgba(220, 220, 220, 1)",
                    pointBackgroundColor: "rgba(220, 220, 220, 1)",
                    pointBorderColor: "#fff",
                    data: incomeData.grossValues,
                  },
                ],
              }}
            />
          </CCardBody>
        </CCard>
      </CCol>
      <CCol xs={6}>
        <CCard className="mb-4">
          <CCardHeader>Έσοδα</CCardHeader>
          <CCardBody>
            <CChartDoughnut
              data={{
                labels: incomeData.labels,
                datasets: [
                  {
                    backgroundColor: [
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
                    ],
                    data: incomeData.grossValues,
                  },
                ],
              }}
            />
          </CCardBody>
        </CCard>
      </CCol>
      <CCol xs={6}>
        <CCard className="mb-4">
          <CCardHeader>Έσοδα</CCardHeader>
          <CCardBody>
            <CChartPie
              data={{
                labels: incomeData.labels,
                datasets: [
                  {
                    data: incomeData.grossValues,
                    backgroundColor: [
                      "#FF6384",
                      "#36A2EB",
                      "#FFCE56",
                      "#4BC0C0",
                      "#9966FF",
                      "#FF9F40",
                      "#FF6384",
                      "#36A2EB",
                      "#FFCE56",
                      "#4BC0C0",
                    ],
                    hoverBackgroundColor: [
                      "#FF6384",
                      "#36A2EB",
                      "#FFCE56",
                      "#4BC0C0",
                      "#9966FF",
                      "#FF9F40",
                      "#FF6384",
                      "#36A2EB",
                      "#FFCE56",
                      "#4BC0C0",
                    ],
                  },
                ],
              }}
            />
          </CCardBody>
        </CCard>
      </CCol>
      <CCol xs={6}>
        <CCard className="mb-4">
          <CCardHeader>Έξοδα</CCardHeader>
          <CCardBody>
            <CChartBar
              data={{
                labels: expenseData.labels,
                datasets: [
                  {
                    label: "Έξοδα ημέρας",
                    backgroundColor: "#f87979",
                    data: expenseData.grossValues,
                  },
                ],
              }}
              labels="dates"
            />
          </CCardBody>
        </CCard>
      </CCol>
      <CCol xs={6}>
        <CCard className="mb-4">
          <CCardHeader>Έξοδα</CCardHeader>
          <CCardBody>
            <CChartLine
              data={{
                labels: expenseData.labels,
                datasets: [
                  {
                    label: "Έξοδα ημέρας",
                    backgroundColor: "rgba(220, 220, 220, 0.2)",
                    borderColor: "rgba(220, 220, 220, 1)",
                    pointBackgroundColor: "rgba(220, 220, 220, 1)",
                    pointBorderColor: "#fff",
                    data: expenseData.grossValues,
                  },
                ],
              }}
            />
          </CCardBody>
        </CCard>
      </CCol>
      <CCol xs={6}>
        <CCard className="mb-4">
          <CCardHeader>Έξοδα</CCardHeader>
          <CCardBody>
            <CChartDoughnut
              data={{
                labels: expenseData.labels,
                datasets: [
                  {
                    backgroundColor: [
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
                    ],
                    data: expenseData.grossValues,
                  },
                ],
              }}
            />
          </CCardBody>
        </CCard>
      </CCol>
      <CCol xs={6}>
        <CCard className="mb-4">
          <CCardHeader>Έξοδα</CCardHeader>
          <CCardBody>
            <CChartPie
              data={{
                labels: expenseData.labels,
                datasets: [
                  {
                    data: expenseData.grossValues,
                    backgroundColor: [
                      "#FF6384",
                      "#36A2EB",
                      "#FFCE56",
                      "#4BC0C0",
                      "#9966FF",
                      "#FF9F40",
                      "#FF6384",
                      "#36A2EB",
                      "#FFCE56",
                      "#4BC0C0",
                    ],
                    hoverBackgroundColor: [
                      "#FF6384",
                      "#36A2EB",
                      "#FFCE56",
                      "#4BC0C0",
                      "#9966FF",
                      "#FF9F40",
                      "#FF6384",
                      "#36A2EB",
                      "#FFCE56",
                      "#4BC0C0",
                    ],
                  },
                ],
              }}
            />
          </CCardBody>
        </CCard>
      </CCol>
      {/* <CCol xs={6}>
        <CCard className="mb-4">
          <CCardHeader>Polar Area Chart</CCardHeader>
          <CCardBody>
            <CChartPolarArea
              data={{
                labels: expenseData.labels,
                datasets: [
                  {
                    data: expenseData.grossValues,
                    backgroundColor: [
                      "#FF6384",
                      "#4BC0C0",
                      "#FFCE56",
                      "#E7E9ED",
                      "#36A2EB",
                      "#FF6384",
                      "#4BC0C0",
                      "#FFCE56",
                      "#E7E9ED",
                      "#36A2EB",
                    ],
                  },
                ],
              }}
            />
          </CCardBody>
        </CCard>
      </CCol>
      <CCol xs={6}>
        <CCard className="mb-4">
          <CCardHeader>Radar Chart</CCardHeader>
          <CCardBody>
            <CChartRadar
              data={{
                labels: expenseData.labels,
                datasets: [
                  {
                    label: "Gross Value",
                    backgroundColor: "rgba(220, 220, 220, 0.2)",
                    borderColor: "rgba(220, 220, 220, 1)",
                    pointBackgroundColor: "rgba(220, 220, 220, 1)",
                    pointBorderColor: "#fff",
                    pointHighlightFill: "#fff",
                    pointHighlightStroke: "rgba(220, 220, 220, 1)",
                    data: expenseData.grossValues,
                  },
                ],
              }}
            />
          </CCardBody>
        </CCard>
      </CCol> */}
    </CRow>
  );
};

export default Charts;
