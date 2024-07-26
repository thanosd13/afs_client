import React, { useEffect, useState } from "react";
import { CCard, CCardBody, CCol, CCardHeader, CRow } from "@coreui/react";
import { CChartBar, CChartDoughnut } from "@coreui/react-chartjs";
import ChartDataLabels from "chartjs-plugin-datalabels";
import UserService from "../../services/UserService";

const Charts = () => {
  const [incomeData, setIncomeData] = useState({ labels: [], datasets: [] });
  const [expenseData, setExpenseData] = useState({ labels: [], datasets: [] });
  const [totalIncome, setTotalIncome] = useState(null);
  const [totalExpenses, setTotalExpenses] = useState(null);
  const [profitOrLoss, setProfitOrLoss] = useState(null);
  const [totalVATIncome, setTotalVATIncome] = useState(null);
  const [totalVATExpenses, setTotalVATExpenses] = useState(null);
  const [VATDifference, setVATDifference] = useState(null);

  useEffect(() => {
    const processData = (data, currentYear) => {
      if (!Array.isArray(data)) {
        data = [data];
      }

      const aggregatedData = {};
      let totalVAT = 0;

      for (let month = 0; month < 12; month++) {
        const currentYearLabel = `${String(month + 1).padStart(2, "0")}/${currentYear.getFullYear()}`;
        const lastYearLabel = `${String(month + 1).padStart(2, "0")}/${currentYear.getFullYear() - 1}`;
        aggregatedData[currentYearLabel] = { currentYear: 0, lastYear: 0 };
        aggregatedData[lastYearLabel] = { currentYear: 0, lastYear: 0 };
      }

      let total = 0;

      data.forEach((item) => {
        const date = new Date(item.issueDate);
        const month = date.getMonth();
        const year = date.getFullYear();

        if (
          year === currentYear.getFullYear() ||
          year === currentYear.getFullYear() - 1
        ) {
          const label = `${String(month + 1).padStart(2, "0")}/${year}`;
          total += parseFloat(item.grossValue);
          totalVAT += parseFloat(item.vatAmount);

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
        total,
        totalVAT,
      };
    };

    const fetchIncome = async () => {
      try {
        const id = localStorage.getItem("id");
        const response = await UserService.requestIncome(id);
        if (response.status === 200) {
          const currentYear = new Date();
          const processedData = processData(response.data.data, currentYear);
          setIncomeData(processedData);
          setTotalIncome(processedData.total);
          setTotalVATIncome(processedData.totalVAT);
        }
      } catch (error) {
        console.log(error);
      }
    };

    const fetchExpenses = async () => {
      try {
        const id = localStorage.getItem("id");
        const response = await UserService.requestExpenses(id);
        if (response.status === 200) {
          const currentYear = new Date();
          const processedData = processData(response.data.data, currentYear);
          setExpenseData(processedData);
          setTotalExpenses(processedData.total);
          setTotalVATExpenses(processedData.totalVAT);
        }
      } catch (error) {
        console.log(error);
      }
    };

    fetchIncome();
    fetchExpenses();
  }, []);

  useEffect(() => {
    if (totalIncome !== null && totalExpenses !== null) {
      setProfitOrLoss((totalIncome - totalExpenses).toFixed(2));
    }
    if (totalVATIncome !== null && totalVATExpenses !== null) {
      setVATDifference((totalVATIncome - totalVATExpenses).toFixed(2));
    }
  }, [totalIncome, totalExpenses, totalVATIncome, totalVATExpenses]);

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
      {profitOrLoss !== null && (
        <CCol xs={12}>
          <CCard className="mb-4">
            <CCardHeader>Σύνολο Έσοδα vs Έξοδα</CCardHeader>
            <CCardBody>
              <div style={{ overflowX: "auto" }}>
                <CChartDoughnut
                  data={{
                    labels: ["Σύνολο Έσοδα", "Σύνολο Έξοδα"],
                    datasets: [
                      {
                        data: [totalIncome, totalExpenses],
                        backgroundColor: ["#41B883", "#E46651"],
                      },
                    ],
                  }}
                  options={{
                    plugins: {
                      datalabels: {
                        display: true,
                        formatter: () => "",
                      },
                      tooltip: {
                        enabled: true,
                      },
                    },
                  }}
                  plugins={[
                    {
                      beforeDraw: function (chart) {
                        const ctx = chart.ctx;
                        ctx.restore();
                        const fontSize = (chart.height / 460).toFixed(2);
                        ctx.font = `${fontSize}em sans-serif`;
                        ctx.textBaseline = "middle";
                        const text =
                          profitOrLoss >= 0
                            ? `Κέρδος: €${profitOrLoss}`
                            : `Ζημία: €${Math.abs(profitOrLoss)}`;
                        const textX = Math.round(
                          (chart.width - ctx.measureText(text).width) / 2
                        );
                        const textY = chart.height / 2;
                        ctx.fillText(text, textX, textY);
                        ctx.save();
                      },
                    },
                  ]}
                />
              </div>
            </CCardBody>
          </CCard>
        </CCol>
      )}
      {VATDifference !== null && (
        <CCol xs={12}>
          <CCard className="mb-4">
            <CCardHeader>Σύνολο ΦΠΑ Έσοδα vs Έξοδα</CCardHeader>
            <CCardBody>
              <div style={{ overflowX: "auto" }}>
                <CChartDoughnut
                  data={{
                    labels: ["Σύνολο ΦΠΑ Έσοδα", "Σύνολο ΦΠΑ Έξοδα"],
                    datasets: [
                      {
                        data: [totalVATIncome, totalVATExpenses],
                        backgroundColor: ["#41B883", "#E46651"],
                      },
                    ],
                  }}
                  options={{
                    plugins: {
                      datalabels: {
                        display: true,
                        formatter: () => "",
                      },
                      tooltip: {
                        enabled: true,
                      },
                    },
                  }}
                  plugins={[
                    {
                      beforeDraw: function (chart) {
                        const ctx = chart.ctx;
                        ctx.restore();
                        const fontSize = (chart.height / 460).toFixed(2);
                        ctx.font = `${fontSize}em sans-serif`;
                        ctx.textBaseline = "middle";
                        const text =
                          VATDifference >= 0
                            ? `Διαφορά ΦΠΑ: €${VATDifference}`
                            : `Διαφορά ΦΠΑ: €${Math.abs(VATDifference)}`;
                        const textX = Math.round(
                          (chart.width - ctx.measureText(text).width) / 2
                        );
                        const textY = chart.height / 2;
                        ctx.fillText(text, textX, textY);
                        ctx.save();
                      },
                    },
                  ]}
                />
              </div>
            </CCardBody>
          </CCard>
        </CCol>
      )}
    </CRow>
  );
};

export default Charts;
