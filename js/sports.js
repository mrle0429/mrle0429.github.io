(function () {
  function parseSportsData() {
    var node = document.getElementById('sports-data');
    if (!node) return null;

    try {
      return JSON.parse(node.textContent);
    } catch (error) {
      console.error('Failed to parse sports page data.', error);
      return null;
    }
  }

  function paceSeconds(chipSec, distance) {
    var divisor = distance === 'FM' ? 42.195 : 21.0975;
    return chipSec / divisor;
  }

  function formatPace(seconds) {
    var minutes = Math.floor(seconds / 60);
    var remain = Math.round(seconds % 60);
    if (remain === 60) {
      minutes += 1;
      remain = 0;
    }
    var pad = function (value) {
      return value < 10 ? '0' + value : '' + value;
    };
    return pad(minutes) + ':' + pad(remain) + '/km';
  }

  function buildSeries(records, distance, pbChipSec) {
    return records.map(function (record) {
      if (record.distance !== distance) return null;

      var isPb = record.chipSec === pbChipSec;
      return {
        value: paceSeconds(record.chipSec, record.distance),
        race: record.race,
        chip: record.chip,
        symbolSize: isPb ? 16 : 10
      };
    });
  }

  function renderPaceChart(data) {
    var chartNode = document.getElementById('sports-pace-chart');
    if (!chartNode || !window.echarts || !data || !Array.isArray(data.records)) return;

    var records = data.records;
    var chart = window.echarts.init(chartNode);
    var option = {
      animationDuration: 900,
      legend: {
        top: 0,
        right: 0,
        itemWidth: 12,
        itemHeight: 12,
        textStyle: {
          color: '#425066',
          fontWeight: 700
        }
      },
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(22, 32, 51, 0.96)',
        borderWidth: 0,
        textStyle: {
          color: '#f8fafc'
        },
        formatter: function (items) {
          var lines = [items[0].axisValueLabel];
          items.forEach(function (item) {
            if (!item.data || item.data.value == null) return;
            lines.push(item.marker + item.seriesName + ' ' + formatPace(item.data.value) + ' · ' + item.data.chip);
            lines.push('&nbsp;&nbsp;&nbsp;&nbsp;' + item.data.race);
          });
          return lines.join('<br>');
        }
      },
      grid: {
        left: '4%',
        right: '4%',
        top: '16%',
        bottom: '12%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: records.map(function (record) { return record.date; }),
        axisLabel: {
          color: '#6d7b91'
        },
        axisLine: {
          lineStyle: {
            color: 'rgba(109,123,145,0.28)'
          }
        }
      },
      yAxis: {
        type: 'value',
        name: 'Pace',
        nameTextStyle: {
          color: '#6d7b91'
        },
        axisLabel: {
          color: '#6d7b91',
          formatter: function (value) {
            return formatPace(value).replace('/km', '');
          }
        },
        min: function (value) {
          return Math.floor(value.min / 10) * 10 - 10;
        },
        max: function (value) {
          return Math.ceil(value.max / 10) * 10 + 10;
        },
        splitLine: {
          lineStyle: {
            color: 'rgba(109,123,145,0.14)'
          }
        }
      },
      series: [
        {
          name: 'FM',
          type: 'line',
          smooth: true,
          connectNulls: true,
          showSymbol: true,
          lineStyle: {
            width: 4,
            color: '#dd6a2d'
          },
          itemStyle: {
            color: '#dd6a2d',
            borderColor: '#fffdf8',
            borderWidth: 2
          },
          data: buildSeries(records, 'FM', data.fmPbChipSec)
        },
        {
          name: 'HM',
          type: 'line',
          smooth: true,
          connectNulls: true,
          showSymbol: true,
          lineStyle: {
            width: 4,
            color: '#137267'
          },
          itemStyle: {
            color: '#137267',
            borderColor: '#fffdf8',
            borderWidth: 2
          },
          data: buildSeries(records, 'HM', data.hmPbChipSec)
        }
      ]
    };

    chart.setOption(option);
    window.addEventListener('resize', function () {
      chart.resize();
    });
  }

  function revealPage() {
    var page = document.querySelector('.sports-page');
    if (!page) return;
    window.requestAnimationFrame(function () {
      page.classList.add('is-ready');
    });
  }

  function init() {
    revealPage();
    renderPaceChart(parseSportsData());
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
