import React, { useEffect, useState } from "react";
import {
  CCard,
  CCardBody,
  CCol,
  CCardHeader,
  CRow,
  CSpinner,
  CButton,
} from "@coreui/react";
import { CChartBar, CChartDoughnut } from "@coreui/react-chartjs";
import UserService from "../../services/UserService";
import { DatePicker } from "rsuite";
import { FaSearch } from "react-icons/fa";
import "./Charts.css";

const Charts = () => {
  const [incomeData, setIncomeData] = useState({ labels: [], datasets: [] });
  const [expenseData, setExpenseData] = useState({ labels: [], datasets: [] });
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [totalIncome, setTotalIncome] = useState(0);
  const [B2BTotal, setB2BTotal] = useState(0);
  const [B2CTotal, setB2CTotal] = useState(0);
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
  const [spinnerIncomeExpenses, setSpinnerIncomeExpenses] = useState(false);
  const [spinnerProfitLoss, setSpinnerProfitLoss] = useState(0);
  const [showIncomeExpenses, setShowIncomeExpenses] = useState(false);
  const [spinnerVAT, setSpinnerVAT] = useState(false);
  const [profitOrLoss, setProfitOrLoss] = useState(0);
  const [lastQuarterIncome, setLastQuarterIncome] = useState(0);
  const [lastQuarterExpenses, setLastQuarterExpenses] = useState(0);
  const [lastQuarterB2B, setLastQuarterB2B] = useState(0);
  const [lastQuarterB2C, setLastQuarterB2C] = useState(0);
  const [lastQuarterVATIncome, setLastQuarterVATIncome] = useState(0);
  const [lastQuarterVATExpenses, setLastQuarterVATExpenses] = useState(0);
  const [lastQuarterProfitOrLoss, setLastQuarterProfitOrLoss] = useState(null);

  const formatNumber = (number) => {
    return new Intl.NumberFormat("el-GR", { minimumFractionDigits: 2 }).format(
      number
    );
  };

  const formatDate = (date) => {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
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

  const processLastQuarterData = (data, type) => {
    if (!Array.isArray(data)) {
      data = [data];
    }

    let totalIncome = 0;
    let totalExpenses = 0;
    let totalB2B = 0;
    let totalB2C = 0;
    let totalVATIncome = 0;
    let totalVATExpenses = 0;
    let totalWithheld = 0;

    const currentDate = new Date();
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(currentDate.getMonth() - 3);

    data.forEach((item) => {
      const date = new Date(item.issueDate);
      if (date >= threeMonthsAgo && date <= currentDate) {
        const grossValue = parseFloat(item.grossValue);
        const vatAmount = parseFloat(item.vatAmount);
        const withheldAmount = parseFloat(item.withheldAmount);
        if (type === "income") {
          totalIncome += grossValue;
          totalVATIncome += vatAmount;
          if (
            !["11.1", "11.2", "11.3", "11.4", "11.5"].includes(item.invType)
          ) {
            totalB2B += grossValue;
          } else {
            totalB2C += grossValue;
          }
        } else if (type === "expense") {
          totalExpenses += grossValue;
          totalVATExpenses += vatAmount;
        }
        totalWithheld += withheldAmount;
      }
    });

    return {
      totalIncome,
      totalExpenses,
      totalB2B,
      totalB2C,
      totalVATIncome,
      totalVATExpenses,
      totalWithheld,
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
        const lastQuarterData = processLastQuarterData(
          response.data.data,
          "income"
        );
        setIncomeData(processedData);
        setB2BTotal(processedData.B2B);
        setB2CTotal(processedData.B2C);
        setLastQuarterB2B(lastQuarterData.totalB2B);
        setLastQuarterB2C(lastQuarterData.totalB2C);
        setLastQuarterIncome(lastQuarterData.totalIncome);
        setLastQuarterVATIncome(lastQuarterData.totalVATIncome);
        setShowIncomeExpenses(true);
      }
      setSpinnerIncomeExpenses(false);
    } catch (error) {
      console.log(error);
      setSpinnerIncomeExpenses(false);
    }
  };

  const fetchExpensesAndWithheldAmounts = async () => {
    try {
      setSpinnerIncomeExpenses(true);
      const id = localStorage.getItem("id");
      const response = await UserService.requestExpenses(id);
      if (response.status === 200) {
        const currentYear = new Date();
        const processedExpenseData = processData(
          response.data.data,
          currentYear
        );
        const lastQuarterData = processLastQuarterData(
          response.data.data,
          "expense"
        );
        setExpenseData(processedExpenseData);
        setTotalExpenses(processedExpenseData.total);
        setLastQuarterExpenses(lastQuarterData.totalExpenses);
        setLastQuarterVATExpenses(lastQuarterData.totalVATExpenses);

        const processedWithheldAmountData = processWithheldAmountData(
          response.data.data
        );
        setWithheldAmountData(processedWithheldAmountData);

        setShowIncomeExpenses(true);
      }
      setSpinnerIncomeExpenses(false);
    } catch (error) {
      console.log(error);
      setSpinnerIncomeExpenses(false);
    }
  };

  const processWithheldAmountData = (data) => {
    if (!Array.isArray(data)) {
      data = [data];
    }

    const aggregatedData = {};
    const currentDate = new Date();
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(currentDate.getMonth() - 3);

    for (
      let date = new Date(threeMonthsAgo);
      date <= new Date();
      date.setMonth(date.getMonth() + 1)
    ) {
      const label = `${String(date.getMonth() + 1).padStart(2, "0")}/${date.getFullYear()}`;
      aggregatedData[label] = 0;
    }

    data.forEach((item) => {
      const date = new Date(item.issueDate);
      if (date >= threeMonthsAgo && date <= new Date()) {
        const label = `${String(date.getMonth() + 1).padStart(2, "0")}/${date.getFullYear()}`;
        aggregatedData[label] += parseFloat(item.withheldAmount);
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

  const processDataWithDates = (data, startDate, endDate) => {
    if (!Array.isArray(data)) {
      data = [data];
    }

    const aggregatedData = {};
    let totalVAT = 0;
    let B2B = 0;
    let B2C = 0;
    let total = 0;

    for (
      let date = new Date(startDate);
      date <= endDate;
      date.setMonth(date.getMonth() + 1)
    ) {
      const label = `${String(date.getMonth() + 1).padStart(2, "0")}/${date.getFullYear()}`;
      aggregatedData[label] = 0;
    }

    data.forEach((item) => {
      const date = new Date(item.issueDate);
      if (date >= startDate && date <= endDate) {
        const label = `${String(date.getMonth() + 1).padStart(2, "0")}/${date.getFullYear()}`;
        total += parseFloat(item.grossValue);
        totalVAT += parseFloat(item.vatAmount);
        aggregatedData[label] += parseFloat(item.grossValue);

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

    const datasetData = labels.map((label) => aggregatedData[label]);

    return {
      labels,
      datasets: [{ label: "Έσοδα/Έξοδα", data: datasetData }],
      total,
      totalVAT,
      B2B,
      B2C,
    };
  };

  const processVATDataWithDates = (
    incomeData,
    expenseData,
    startDate,
    endDate
  ) => {
    const processVATData = (data) => {
      if (!Array.isArray(data)) {
        data = [data];
      }

      const aggregatedData = {};
      let totalVAT = 0;

      for (
        let date = new Date(startDate);
        date <= endDate;
        date.setMonth(date.getMonth() + 1)
      ) {
        const label = `${String(date.getMonth() + 1).padStart(2, "0")}/${date.getFullYear()}`;
        aggregatedData[label] = 0;
      }

      data.forEach((item) => {
        const date = new Date(item.issueDate);
        if (date >= startDate && date <= endDate) {
          const label = `${String(date.getMonth() + 1).padStart(2, "0")}/${date.getFullYear()}`;
          totalVAT += parseFloat(item.vatAmount);
          aggregatedData[label] += parseFloat(item.vatAmount);
        }
      });

      const labels = Object.keys(aggregatedData).sort((a, b) => {
        const [monthA, yearA] = a.split("/").map(Number);
        const [monthB, yearB] = b.split("/").map(Number);
        return new Date(yearA, monthA - 1) - new Date(yearB, monthB - 1);
      });

      const datasetData = labels.map((label) => aggregatedData[label]);

      return {
        labels,
        datasets: [{ label: "ΦΠΑ", data: datasetData }],
        totalVAT,
      };
    };

    const incomeVATData = processVATData(incomeData);
    const expenseVATData = processVATData(expenseData);

    return {
      incomeVATData,
      expenseVATData,
    };
  };

  const processWithheldAmountDataWithDates = (data, startDate, endDate) => {
    if (!Array.isArray(data)) {
      data = [data];
    }

    const aggregatedData = {};
    const start = new Date(startDate);
    const end = new Date(endDate);

    for (
      let date = new Date(start);
      date <= end;
      date.setMonth(date.getMonth() + 1)
    ) {
      const label = `${String(date.getMonth() + 1).padStart(2, "0")}/${date.getFullYear()}`;
      aggregatedData[label] = 0;
    }

    data.forEach((item) => {
      const date = new Date(item.issueDate);
      if (date >= start && date <= end) {
        const label = `${String(date.getMonth() + 1).padStart(2, "0")}/${date.getFullYear()}`;
        aggregatedData[label] += parseFloat(item.withheldAmount);
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

  useEffect(() => {
    const fetchAllData = async () => {
      await fetchIncome();
      await fetchExpensesAndWithheldAmounts();
    };
    fetchAllData();
  }, []);

  useEffect(() => {
    if (incomeData.labels.length && expenseData.labels.length) {
      const updatedProfitOrLoss = B2BTotal + B2CTotal - totalExpenses;
      const updatedLastQuarterProfitOrLoss =
        lastQuarterIncome - lastQuarterExpenses;
      setProfitOrLoss(updatedProfitOrLoss);
      setLastQuarterProfitOrLoss(updatedLastQuarterProfitOrLoss);
    }
  }, [
    B2BTotal,
    B2CTotal,
    totalExpenses,
    lastQuarterIncome,
    lastQuarterExpenses,
  ]);

  const fetchWithheldAmounts = async (from, to) => {
    try {
      setSpinnerIncomeExpenses(true);
      const id = localStorage.getItem("id");
      const response = await UserService.requestExpensesWithDates(
        id,
        formatDate(from),
        formatDate(to)
      );
      if (response.status === 200) {
        const processedData = processWithheldAmountDataWithDates(
          response.data.data,
          from,
          to
        );
        setWithheldAmountData(processedData);
      }
      setSpinnerIncomeExpenses(false);
    } catch (error) {
      console.log(error);
    }
  };

  const fetchProfitLossWithDates = async (from, to) => {
    try {
      setSpinnerProfitLoss(true);
      const id = localStorage.getItem("id");
      const incomeResponse = await UserService.requestIncomeWithDates(
        id,
        formatDate(from),
        formatDate(to)
      );
      const expenseResponse = await UserService.requestExpensesWithDates(
        id,
        formatDate(from),
        formatDate(to)
      );

      if (incomeResponse.status === 200 && expenseResponse.status === 200) {
        const processedIncomeData = processDataWithDates(
          incomeResponse.data.data,
          new Date(from),
          new Date(to)
        );
        const processedExpenseData = processDataWithDates(
          expenseResponse.data.data,
          new Date(from),
          new Date(to)
        );

        console.log("income with dates:", processedIncomeData);
        console.log("expenses with dates:", processedExpenseData);
        // setTotalIncome(processedIncomeData.total);
        setTotalExpenses(processedExpenseData.total);
        setB2BTotal(processedIncomeData.B2B);
        setB2CTotal(processedIncomeData.B2C);
        setLastQuarterB2B(processedIncomeData.B2B);
        setLastQuarterB2C(processedIncomeData.B2C);
        setLastQuarterExpenses(processedExpenseData.total);
        setShowIncomeExpenses(true);

        const updatedProfitOrLoss =
          processedIncomeData.B2B +
          processedIncomeData.B2C -
          processedExpenseData.total;
        setLastQuarterProfitOrLoss(updatedProfitOrLoss);
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
      const id = localStorage.getItem("id");
      const incomeResponse = await UserService.requestIncomeWithDates(
        id,
        formatDate(from),
        formatDate(to)
      );
      const expenseResponse = await UserService.requestExpensesWithDates(
        id,
        formatDate(from),
        formatDate(to)
      );

      if (incomeResponse.status === 200 && expenseResponse.status === 200) {
        const processedData = processVATDataWithDates(
          incomeResponse.data.data,
          expenseResponse.data.data,
          new Date(from),
          new Date(to)
        );

        setLastQuarterVATIncome(processedData.incomeVATData.totalVAT);
        setLastQuarterVATExpenses(processedData.expenseVATData.totalVAT);
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
          <CCardHeader>Παρακρατούμενοι Φόροι</CCardHeader>
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
                  shouldDisableDateW={(date) => date > new Date()}
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
                className="col-sm-3 col-lg-3 mobile-search"
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
            {spinnerIncomeExpenses ? (
              <div className="text-center">
                <CSpinner />
              </div>
            ) : (
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
                className="col-sm-3 col-lg-3 mobile-search"
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
            {spinnerProfitLoss ? (
              <div className="text-center">
                <CSpinner />
              </div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                {lastQuarterProfitOrLoss !== null && (
                  <CChartDoughnut
                    data={{
                      labels: ["B2B Έσοδα", "B2C Έσοδα", "Σύνολο Έξοδα"],
                      datasets: [
                        {
                          data: [
                            lastQuarterB2B,
                            lastQuarterB2C,
                            lastQuarterExpenses,
                          ],
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
                            lastQuarterProfitOrLoss >= 0
                              ? `Κέρδος: €${formatNumber(lastQuarterProfitOrLoss)}`
                              : `Ζημία: €${formatNumber(Math.abs(lastQuarterProfitOrLoss))}`;
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
                )}
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
                className="col-sm-3 col-lg-3 mobile-search"
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
            {spinnerVAT ? (
              <div className="text-center">
                <CSpinner />
              </div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                {lastQuarterProfitOrLoss !== null && (
                  <CChartDoughnut
                    data={{
                      labels: ["ΦΠΑ Έσοδα", "ΦΠΑ Έξοδα"],
                      datasets: [
                        {
                          data: [lastQuarterVATIncome, lastQuarterVATExpenses],
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
                            lastQuarterVATIncome - lastQuarterVATExpenses >= 0
                              ? `ΦΠΑ προς απόδοση: €${formatNumber(
                                  lastQuarterVATIncome - lastQuarterVATExpenses
                                )}`
                              : `ΦΠΑ προς επιστροφή: €${formatNumber(
                                  lastQuarterVATIncome - lastQuarterVATExpenses
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
                )}
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
