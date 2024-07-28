import React, { useEffect, useState } from "react";
import { CCard, CCardBody, CCol, CCardHeader, CRow } from "@coreui/react";
import { CChartBar, CChartDoughnut } from "@coreui/react-chartjs";
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
  const [B2BTotal, setB2BTotal] = useState(null);
  const [B2CTotal, setB2CTotal] = useState(null);
  const [withheldAmountData, setWithheldAmountData] = useState({
    labels: [],
    datasets: [],
  });

  const formatNumber = (number) => {
    return new Intl.NumberFormat("el-GR", { minimumFractionDigits: 2 }).format(
      number
    );
  };

  useEffect(() => {
    const processData = (data, currentYear) => {
      if (!Array.isArray(data)) {
        data = [data];
      }

      const aggregatedData = {};
      let totalVAT = 0;
      let B2B = 0;
      let B2C = 0;

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

          // Calculate B2B and B2C totals
          if (
            !["11.1", "11.2", "11.3", "11.4", "11.5"].includes(item.invType)
          ) {
            B2B += parseFloat(item.grossValue);
          } else {
            B2C += parseFloat(item.grossValue);
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
        B2B,
        B2C,
      };
    };

    const processWithheldAmountData = (data, currentYear) => {
      if (!Array.isArray(data)) {
        data = [data];
      }

      const aggregatedData = {};

      for (let month = 0; month < 6; month++) {
        const date = new Date(currentYear);
        date.setMonth(date.getMonth() - month);
        const label = `${String(date.getMonth() + 1).padStart(2, "0")}/${date.getFullYear()}`;
        aggregatedData[label] = 0;
      }

      data.forEach((item) => {
        const date = new Date(item.issueDate);
        const month = date.getMonth();
        const year = date.getFullYear();

        if (
          new Date(currentYear).setMonth(currentYear.getMonth() - 6) <= date
        ) {
          const label = `${String(month + 1).padStart(2, "0")}/${year}`;
          if (aggregatedData[label] !== undefined) {
            aggregatedData[label] += parseFloat(item.withheldAmount);
          }
        }
      });

      const labels = Object.keys(aggregatedData).sort((a, b) => {
        const [monthA, yearA] = a.split("/").map(Number);
        const [monthB, yearB] = b.split("/").map(Number);
        return new Date(yearA, monthA - 1) - new Date(yearB, monthB - 1);
      });
      const withheldData = labels.map((label) => aggregatedData[label]);

      return {
        labels,
        datasets: [{ label: "Παρακρατούμενοι φόροι", data: withheldData }],
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
          setB2BTotal(processedData.B2B);
          setB2CTotal(processedData.B2C);
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

    const fetchWithheldAmounts = async () => {
      try {
        const id = localStorage.getItem("id");
        const response = await UserService.requestExpenses(id);
        if (response.status === 200) {
          const currentYear = new Date();
          const processedData = processWithheldAmountData(
            response.data.data,
            currentYear
          );
          setWithheldAmountData(processedData);
        }
      } catch (error) {
        console.log(error);
      }
    };

    fetchIncome();
    fetchExpenses();
    fetchWithheldAmounts();
  }, []);

  useEffect(() => {
    if (totalIncome !== null && totalExpenses !== null) {
      const profitOrLossValue = totalIncome - totalExpenses;
      setProfitOrLoss(profitOrLossValue);
    }
    if (totalVATIncome !== null && totalVATExpenses !== null) {
      const VATDifferenceValue = totalVATIncome - totalVATExpenses;
      setVATDifference(VATDifferenceValue);
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
                options={{
                  tooltips: {
                    callbacks: {
                      label: function (tooltipItem, data) {
                        const datasetLabel =
                          data.datasets[tooltipItem.datasetIndex].label || "";
                        return `${datasetLabel}: ${formatNumber(
                          tooltipItem.yLabel
                        )}`;
                      },
                    },
                  },
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
              <CChartBar
                data={{
                  labels: expenseData.labels,
                  datasets: expenseData.datasets.map((dataset, index) => ({
                    ...dataset,
                    backgroundColor: index === 0 ? "#f87979" : "#36A2EB",
                  })),
                }}
                labels="dates"
                options={{
                  tooltips: {
                    callbacks: {
                      label: function (tooltipItem, data) {
                        const datasetLabel =
                          data.datasets[tooltipItem.datasetIndex].label || "";
                        return `${datasetLabel}: ${formatNumber(
                          tooltipItem.yLabel
                        )}`;
                      },
                    },
                  },
                }}
              />
            </div>
          </CCardBody>
        </CCard>
      </CCol>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader>Παρακρατούμενοι φόροι</CCardHeader>
          <CCardBody>
            <div style={{ overflowX: "auto" }}>
              <CChartBar
                data={{
                  labels: withheldAmountData.labels,
                  datasets: withheldAmountData.datasets.map(
                    (dataset, index) => ({
                      ...dataset,
                      backgroundColor: "#FFCE56",
                    })
                  ),
                }}
                labels="dates"
                options={{
                  tooltips: {
                    callbacks: {
                      label: function (tooltipItem, data) {
                        const datasetLabel =
                          data.datasets[tooltipItem.datasetIndex].label || "";
                        return `${datasetLabel}: ${formatNumber(
                          tooltipItem.yLabel
                        )}`;
                      },
                    },
                  },
                }}
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
                    labels: ["B2B Έσοδα", "B2C Έσοδα", "Σύνολο Έξοδα"],
                    datasets: [
                      {
                        data: [B2BTotal, B2CTotal, totalExpenses],
                        backgroundColor: ["#FFCE56", "#36A2EB", "#E46651"],
                      },
                    ],
                  }}
                  options={{
                    tooltips: {
                      callbacks: {
                        label: function (tooltipItem, data) {
                          return formatNumber(
                            data.datasets[0].data[tooltipItem.index]
                          );
                        },
                      },
                    },
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
                        const mobile =
                          window.matchMedia("(max-width: 768px)").matches;
                        const fontSize = (
                          chart.height / (mobile ? 660 : 460)
                        ).toFixed(2);
                        ctx.font = `${fontSize}em sans-serif`;
                        ctx.textBaseline = "middle";
                        const text =
                          profitOrLoss >= 0
                            ? `Κέρδος: €${formatNumber(profitOrLoss)}`
                            : `Ζημία: €${formatNumber(Math.abs(profitOrLoss))}`;
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
                    tooltips: {
                      callbacks: {
                        label: function (tooltipItem, data) {
                          return formatNumber(
                            data.datasets[0].data[tooltipItem.index]
                          );
                        },
                      },
                    },
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
                        const mobile =
                          window.matchMedia("(max-width: 768px)").matches;
                        const fontSize = (
                          chart.height / (mobile ? 660 : 460)
                        ).toFixed(2);
                        ctx.font = `${fontSize}em sans-serif`;
                        ctx.textBaseline = "middle";
                        const text =
                          VATDifference >= 0
                            ? `ΦΠΑ προς απόδοση: €${formatNumber(VATDifference)}`
                            : `ΦΠΑ προς επιστροφή: €${formatNumber(
                                Math.abs(VATDifference)
                              )}`;
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
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader>Σύνολο Τζίρος vs Έξοδα</CCardHeader>
          <CCardBody>
            <div
              style={{
                overflowX: "auto",
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "flex-start",
                flexDirection: "column",
              }}
            >
              <span style={{ fontSize: "1.5rem" }}>
                Συνολικός Τζίρος: <b>{formatNumber(B2BTotal + B2CTotal)}</b>
              </span>
              <span style={{ fontSize: "1.5rem" }}>
                Συνολικά Έξοδα: <b>{formatNumber(totalExpenses)}</b>
              </span>
            </div>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  );
};

export default Charts;
