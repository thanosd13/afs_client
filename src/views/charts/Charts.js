import React, { useEffect, useState } from "react";
import {
  CCard,
  CCardBody,
  CCol,
  CCardHeader,
  CRow,
  CButton,
  CSpinner,
} from "@coreui/react";
import { CChartBar, CChartDoughnut } from "@coreui/react-chartjs";
import { FaSearch } from "react-icons/fa";
import "./Charts.css";
import { DatePicker } from "rsuite";
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
  const [dateFrom, setDateFrom] = useState(null);
  const [dateTo, setDateTo] = useState(null);
  const [dateFromProfitLoss, setDateFromProfitLoss] = useState(null);
  const [dateToProfitLoss, setDateToProfitLoss] = useState(null);
  const [dateFromVAT, setDateFromVAT] = useState(null);
  const [dateToVAT, setDateToVAT] = useState(null);
  const [showWithheldTaxes, setShowWithheldTaxes] = useState(false);
  const [showIncomeExpenses, setShowIncomeExpenses] = useState(false);
  const [showProfitLoss, setShowProfitLoss] = useState(false);
  const [showVAT, setShowVAT] = useState(false);
  const [spinner, setSpinner] = useState(false);
  const [spinnerIncomeExpenses, setSpinnerIncomeExpenses] = useState(false);
  const [spinnerProfitLoss, setSpinnerProfitLoss] = useState(false);
  const [spinnerVAT, setSpinnerVAT] = useState(false);

  const formatNumber = (number) => {
    return new Intl.NumberFormat("el-GR", { minimumFractionDigits: 2 }).format(
      number
    );
  };

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
        if (!["11.1", "11.2", "11.3", "11.4", "11.5"].includes(item.invType)) {
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

  const processWithheldAmountData = (data, from, to) => {
    if (!Array.isArray(data)) {
      data = [data];
    }

    const aggregatedData = {};
    const labels = [];
    const startDate = new Date(from);
    const endDate = new Date(to);
    const currentYear = startDate.getFullYear();

    while (startDate <= endDate) {
      const label = `${String(startDate.getMonth() + 1).padStart(2, "0")}/${startDate.getFullYear()}`;
      aggregatedData[label] = 0;
      labels.push(label);
      startDate.setMonth(startDate.getMonth() + 1);
    }

    data.forEach((item) => {
      const date = new Date(item.issueDate);
      const label = `${String(date.getMonth() + 1).padStart(2, "0")}/${date.getFullYear()}`;

      if (aggregatedData[label] !== undefined) {
        aggregatedData[label] += parseFloat(item.withheldAmount);
      }
    });

    const withheldData = labels.map((label) => aggregatedData[label]);

    return {
      labels,
      datasets: [{ label: "Παρακρατούμενοι φόροι", data: withheldData }],
    };
  };

  const fetchIncome = async () => {
    try {
      setSpinnerIncomeExpenses(true);
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
        setShowIncomeExpenses(true);
      }
      setSpinnerIncomeExpenses(false);
    } catch (error) {
      console.log(error);
      setSpinnerIncomeExpenses(false);
    }
  };

  const fetchExpenses = async () => {
    try {
      setSpinnerIncomeExpenses(true);
      const id = localStorage.getItem("id");
      const response = await UserService.requestExpenses(id);
      if (response.status === 200) {
        const currentYear = new Date();
        const processedData = processData(response.data.data, currentYear);
        setExpenseData(processedData);
        setTotalExpenses(processedData.total);
        setTotalVATExpenses(processedData.totalVAT);
        setShowIncomeExpenses(true);
      }
      setSpinnerIncomeExpenses(false);
    } catch (error) {
      console.log(error);
      setSpinnerIncomeExpenses(false);
    }
  };

  useEffect(() => {
    fetchIncome();
    fetchExpenses();
  }, []);

  const fetchWithheldAmounts = async (from, to) => {
    try {
      setSpinner(true);
      setShowWithheldTaxes(false);
      const id = localStorage.getItem("id");
      const response = await UserService.requestExpensesWithDates(id, from, to);
      if (response.status === 200) {
        const processedData = processWithheldAmountData(
          response.data.data,
          from,
          to
        );
        setSpinner(false);
        setWithheldAmountData(processedData);
        setShowWithheldTaxes(true);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const fetchProfitLossWithDates = async (from, to) => {
    try {
      setSpinnerProfitLoss(true);
      setShowProfitLoss(false);
      const id = localStorage.getItem("id");
      const incomeResponse = await UserService.requestIncomeWithDates(
        id,
        from,
        to
      );
      const expenseResponse = await UserService.requestExpensesWithDates(
        id,
        from,
        to
      );

      if (incomeResponse.status === 200 && expenseResponse.status === 200) {
        const processedIncomeData = processData(
          incomeResponse.data.data,
          new Date(from)
        );
        const processedExpenseData = processData(
          expenseResponse.data.data,
          new Date(from)
        );

        setTotalIncome(processedIncomeData.total);
        setB2BTotal(processedIncomeData.B2B);
        setB2CTotal(processedIncomeData.B2C);
        setTotalExpenses(processedExpenseData.total);

        const profitOrLossValue =
          processedIncomeData.total - processedExpenseData.total;
        setProfitOrLoss(profitOrLossValue);
        setShowProfitLoss(true);
      }
      setSpinnerProfitLoss(false);
    } catch (error) {
      console.log(error);
      setSpinnerProfitLoss(false);
    }
  };

  const fetchVATWithDates = async (from, to) => {
    try {
      setSpinnerVAT(true);
      setShowVAT(false);
      const id = localStorage.getItem("id");
      const incomeResponse = await UserService.requestIncomeWithDates(
        id,
        from,
        to
      );
      const expenseResponse = await UserService.requestExpensesWithDates(
        id,
        from,
        to
      );

      if (incomeResponse.status === 200 && expenseResponse.status === 200) {
        const processedIncomeData = processData(
          incomeResponse.data.data,
          new Date(from)
        );
        const processedExpenseData = processData(
          expenseResponse.data.data,
          new Date(from)
        );

        setTotalVATIncome(processedIncomeData.totalVAT);
        setTotalVATExpenses(processedExpenseData.totalVAT);

        const VATDifferenceValue =
          processedIncomeData.totalVAT - processedExpenseData.totalVAT;
        setVATDifference(VATDifferenceValue);
        setShowVAT(true);
      }
      setSpinnerVAT(false);
    } catch (error) {
      console.log(error);
      setSpinnerVAT(false);
    }
  };

  const handleSearchWithheldTaxes = () => {
    if (dateFrom && dateTo) {
      fetchWithheldAmounts(dateFrom, dateTo);
    }
  };

  const handleSearchProfitLoss = () => {
    if (dateFromProfitLoss && dateToProfitLoss) {
      fetchProfitLossWithDates(dateFromProfitLoss, dateToProfitLoss);
    }
  };

  const handleSearchVAT = () => {
    if (dateFromVAT && dateToVAT) {
      fetchVATWithDates(dateFromVAT, dateToVAT);
    }
  };

  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader>Έσοδα</CCardHeader>
          <CCardBody>
            {spinnerIncomeExpenses ? (
              <div className="text-center">
                <CSpinner />
              </div>
            ) : (
              showIncomeExpenses && (
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
                              data.datasets[tooltipItem.datasetIndex].label ||
                              "";
                            return `${datasetLabel}: ${formatNumber(
                              tooltipItem.yLabel
                            )}`;
                          },
                        },
                      },
                    }}
                  />
                </div>
              )
            )}
          </CCardBody>
        </CCard>
      </CCol>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader>Έξοδα</CCardHeader>
          <CCardBody>
            {spinnerIncomeExpenses ? (
              <div className="text-center">
                <CSpinner />
              </div>
            ) : (
              showIncomeExpenses && (
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
                              data.datasets[tooltipItem.datasetIndex].label ||
                              "";
                            return `${datasetLabel}: ${formatNumber(
                              tooltipItem.yLabel
                            )}`;
                          },
                        },
                      },
                    }}
                  />
                </div>
              )
            )}
          </CCardBody>
        </CCard>
      </CCol>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader>Παρακρατούμενοι φόροι</CCardHeader>
          <CCardBody>
            <div style={{ paddingBottom: "3rem" }} className="row">
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "1rem",
                }}
                className="col-sm-4 col-lg-4 mb-3 mb-sm-0"
              >
                <label>
                  <b>Από:</b>
                </label>
                <DatePicker
                  oneTap
                  selected={dateFrom}
                  onChange={(date) => setDateFrom(date)}
                  disabledDate={(date) => date > new Date()}
                />
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "1rem",
                }}
                className="col-sm-3 col-lg-3"
              >
                <label>
                  <b>Εώς:</b>
                </label>
                <DatePicker
                  oneTap
                  selected={dateTo}
                  onChange={(date) => setDateTo(date)}
                  shouldDisableDate={(date) => date > new Date()}
                />
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "1rem",
                }}
                className="col-sm-3 col-lg-3"
              >
                <CButton
                  color="primary"
                  className="px-4 search_btn"
                  onClick={handleSearchWithheldTaxes}
                >
                  <FaSearch />
                  Αναζήτηση
                </CButton>
              </div>
            </div>
            {spinner && (
              <div className="text-center">
                <CSpinner />
              </div>
            )}
            {showWithheldTaxes && (
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
            )}
          </CCardBody>
        </CCard>
      </CCol>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader>Σύνολο Έσοδα vs Έξοδα</CCardHeader>
          <CCardBody>
            <div style={{ paddingBottom: "3rem" }} className="row">
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "1rem",
                }}
                className="col-sm-4 col-lg-4 mb-3 mb-sm-0"
              >
                <label>
                  <b>Από:</b>
                </label>
                <DatePicker
                  oneTap
                  selected={dateFromProfitLoss}
                  onChange={(date) => setDateFromProfitLoss(date)}
                  disabledDate={(date) => date > new Date()}
                />
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "1rem",
                }}
                className="col-sm-3 col-lg-3"
              >
                <label>
                  <b>Εώς:</b>
                </label>
                <DatePicker
                  oneTap
                  selected={dateToProfitLoss}
                  onChange={(date) => setDateToProfitLoss(date)}
                  shouldDisableDate={(date) => date > new Date()}
                />
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "1rem",
                }}
                className="col-sm-3 col-lg-3"
              >
                <CButton
                  color="primary"
                  className="px-4 search_btn"
                  onClick={handleSearchProfitLoss}
                >
                  <FaSearch />
                  Αναζήτηση
                </CButton>
              </div>
            </div>
            {spinnerProfitLoss && (
              <div className="text-center">
                <CSpinner />
              </div>
            )}
            {showProfitLoss && (
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
            )}
          </CCardBody>
        </CCard>
      </CCol>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader>Σύνολο ΦΠΑ Έσοδα vs Έξοδα</CCardHeader>
          <CCardBody>
            <div style={{ paddingBottom: "3rem" }} className="row">
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "1rem",
                }}
                className="col-sm-4 col-lg-4 mb-3 mb-sm-0"
              >
                <label>
                  <b>Από:</b>
                </label>
                <DatePicker
                  oneTap
                  selected={dateFromVAT}
                  onChange={(date) => setDateFromVAT(date)}
                  disabledDate={(date) => date > new Date()}
                />
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "1rem",
                }}
                className="col-sm-3 col-lg-3"
              >
                <label>
                  <b>Εώς:</b>
                </label>
                <DatePicker
                  oneTap
                  selected={dateToVAT}
                  onChange={(date) => setDateToVAT(date)}
                  shouldDisableDate={(date) => date > new Date()}
                />
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "1rem",
                }}
                className="col-sm-3 col-lg-3"
              >
                <CButton
                  color="primary"
                  className="px-4 search_btn"
                  onClick={handleSearchVAT}
                >
                  <FaSearch />
                  Αναζήτηση
                </CButton>
              </div>
            </div>
            {spinnerVAT && (
              <div className="text-center">
                <CSpinner />
              </div>
            )}
            {showVAT && (
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
                          chart.height / (mobile ? 660 : 560)
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
            )}
          </CCardBody>
        </CCard>
      </CCol>
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
