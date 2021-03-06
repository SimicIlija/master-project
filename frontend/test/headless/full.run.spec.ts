const Nightmare = require('nightmare');
require('nightmare-upload')(Nightmare);
import { expect } from 'chai';
import { TestUtil } from './util/test.util';

/**
 * runs through all 3 pages of the app:
 *  - uploads a file
 *  - goes to the graph page, adds nodes and edges, uploads the graph
 *  - goes to the results page and views the results
 */
describe('Full run', () => {
  /**
   * using a simple data file, generated by me (about 50 lines)
   */
  it('full run using a small data file (50 lines)', async function() {
    const nightmare = Nightmare();
    const testUtil = new TestUtil(nightmare);
    await testUtil.fullRun({
      upload: {
        file: 'simple_data_1.csv',
        expectedFeatures: ['enabled', 'running', 'blocked', 'level', 'test', 'timed', 'something'],
      },
      graph: {
        treatment: 'enabled',
        outcome: 'level',
        edges: [
          ['enabled', 'level'],
        ],
        disabledMethods: ['ivs', 'regDiscont', 'twoStageReg'],
      },
      results: {
        methods: { regression: [0.24, 0.28] },
        waitMs: 5000,
      },
    });
  }, 30000);

  /**
   * using a simple data file, generated by me (about 50 lines)
   * this time add more edges, not just between the treatment and outcome
   */
  it('full run using a small data file (50 lines), with more edges', async function() {
    const nightmare = Nightmare();
    const testUtil = new TestUtil(nightmare);
    await testUtil.fullRun({
      upload: {
        file: 'simple_data_1.csv',
        expectedFeatures: ['enabled', 'running', 'blocked', 'level', 'test', 'timed', 'something'],
      },
      graph: {
        treatment: 'enabled',
        outcome: 'level',
        edges: [
          ['enabled', 'level'],
          ['running', 'blocked'],
          ['blocked', 'level'],
          ['something', 'running'],
          ['test', 'timed'],
        ],
        disabledMethods: ['ivs', 'regDiscont', 'twoStageReg'],
      },
      results: {
        methods: { regression: [0.24, 0.28] },
        waitMs: 5000,
      },
    });
  }, 30000);

  /**
   * using a simple data file, generated by me (about 1900 lines)
   * following features: 'exercise', 'health', 'smokes', 'sociality', 'stress'
   * first 1500 entries have random values [0, 10]
   * the last 400 contain higher values for 'exercise' and 'health', others have random lower values
   */
  it('full run using the exercise and health file', async function() {
    const nightmare = Nightmare();
    const testUtil = new TestUtil(nightmare);
    await testUtil.fullRun({
      upload: {
        file: 'exercise_and_health_1.csv',
        expectedFeatures: ['exercise', 'health', 'smokes', 'sociality', 'stress'],
      },
      graph: {
        treatment: 'exercise',
        outcome: 'health',
        edges: [
          ['exercise', 'health'],
          ['smokes', 'health'],
          ['sociality', 'exercise'],
          ['sociality', 'smokes'],
          ['stress', 'smokes'],
        ],
        disabledMethods: ['ivs', 'regDiscont', 'twoStageReg'],
      },
      results: {
        methods: { regression: [0.12, 0.15] },
        waitMs: 5000,
      },
    });
  }, 30000);

  it('full run using the exercise and health file with a custom separator', async function() {
    const nightmare = Nightmare();
    const testUtil = new TestUtil(nightmare);
    await testUtil.fullRun({
      upload: {
        file: 'exercise_and_health_underline_separator.csv',
        expectedFeatures: ['exercise', 'health', 'smokes', 'sociality', 'stress'],
        separator: '___'
      },
      graph: {
        treatment: 'exercise',
        outcome: 'health',
        edges: [
          ['exercise', 'health'],
          ['smokes', 'health'],
          ['sociality', 'exercise'],
          ['sociality', 'smokes'],
          ['stress', 'smokes'],
        ],
        disabledMethods: ['ivs', 'regDiscont', 'twoStageReg'],
      },
      results: {
        methods: { regression: [0.12, 0.15] },
        waitMs: 5000,
      },
    });
  }, 30000);

  /**
   * uses a data file created using the dowhy lib (see https://microsoft.github.io/dowhy/example_notebooks/dowhy_estimation_methods.html)
   * using this dataset (and the corresponding graph), results should be available via all 6 methods
   */
  it('full run using the dataset created using the dowhy lib, expect all 6 methods', async function () {
    const nightmare = Nightmare();
    const testUtil = new TestUtil(nightmare);
    await testUtil.fullRun({
      upload: {
        file: 'dowhy_linear.csv',
        expectedFeatures: ['Z0', 'Z1', 'W0', 'W1', 'W2', 'W3', 'W4', 'v0', 'y'],
      },
      graph: {
        treatment: 'v0',
        outcome: 'y',
        ivs: ['Z0', 'Z1'],
        edges: [
          ['v0', 'y'],
          ['Z0', 'v0'],
          ['Z1', 'v0'],
          ['W0', 'v0'],
          ['W0', 'y'],
          ['W1', 'v0'],
          ['W1', 'y'],
          ['W2', 'v0'],
          ['W2', 'y'],
          ['W3', 'v0'],
          ['W3', 'y'],
          ['W4', 'v0'],
          ['W4', 'y'],
        ],
        ivMethodInstrument: 'Z0',
        regDiscontVarName: 'Z1',
      },
      results: {
        methods: {
          regression: [8, 12],
          stratification:  [8, 12],
          matching:  [8, 12],
          weighting:  [8, 12],
          ivs:  [8, 12],
          regDiscont:  [8, 12],
        },
        waitMs: 20000,
      },
    });
  }, 60000);

  it('full run using the dowhy dataset, expect all 6 methods + NIE and NDE estimation', async function () {
    const nightmare = Nightmare();
    const testUtil = new TestUtil(nightmare);
    await testUtil.fullRun({
      upload: {
        file: 'dowhy_linear.csv',
        expectedFeatures: ['Z0', 'Z1', 'W0', 'W1', 'W2', 'W3', 'W4', 'v0', 'y'],
      },
      graph: {
        treatment: 'v0',
        outcome: 'y',
        commonCauses: ['W1'],
        ivs: ['Z1'],
        edges: [
          // v0 to y via the frontdoor W0
          ['v0', 'W0'],
          ['W0', 'y'],
          ['W1', 'v0'],
          ['W1', 'y'],
          ['Z1', 'v0'],
        ],
        ivMethodInstrument: 'Z0',
        regDiscontVarName: 'Z1',
      },
      results: {
        methods: {
          regression: [8, 14],
          stratification:  [8, 14],
          matching:  [8, 14],
          weighting:  [8, 14],
          ivs:  [8, 14],
          regDiscont:  [8, 14],
          nde: [8, 12],
          nie: [1, 4],
        },
        waitMs: 20000,
      },
    });
  }, 60000);

  it('full run using the dowhy dataset with a custom graph file, expect all 6 methods + NIE and NDE estimation', async function () {
    const nightmare = Nightmare();
    const testUtil = new TestUtil(nightmare);
    await testUtil.fullRun({
      upload: {
        file: 'dowhy_linear.csv',
        expectedFeatures: ['Z0', 'Z1', 'W0', 'W1', 'W2', 'W3', 'W4', 'v0', 'y'],
      },
      graph: {
        treatment: 'v0',
        outcome: 'y',
        commonCauses: ['W1'],
        ivs: ['Z1'],
        ivMethodInstrument: 'Z0',
        regDiscontVarName: 'Z1',
        file: 'dowhy_linear_custom_graph.gml',
      },
      results: {
        methods: {
          regression: [8, 14],
          stratification:  [8, 14],
          matching:  [8, 14],
          weighting:  [8, 14],
          ivs:  [8, 14],
          regDiscont:  [8, 14],
          nde: [8, 12],
          nie: [1, 4],
        },
        waitMs: 20000,
      },
    });
  }, 60000);

  it('full run using the dowhy dataset, expect all 6 methods + NIE and NDE estimation via user-specified header (data file contains no header data)', async function () {
    const nightmare = Nightmare();
    const testUtil = new TestUtil(nightmare);
    await testUtil.fullRun({
      upload: {
        file: 'dowhy_linear_no_header.csv',
        expectedFeatures: ['iv0', 'iv1', 'cc0', 'cc1', 'cc2', 'cc3', 'cc4', 'treatment', 'outcome'],
        customHeaders: ['iv0', 'iv1', 'cc0', 'cc1', 'cc2', 'cc3', 'cc4', 'treatment', 'outcome'],
      },
      graph: {
        treatment: 'treatment',
        outcome: 'outcome',
        commonCauses: ['cc1'],
        ivs: ['iv1'],
        edges: [
          ['treatment', 'cc0'],
          ['cc0', 'outcome'],
          ['cc1', 'treatment'],
          ['cc1', 'outcome'],
          ['iv1', 'treatment'],
        ],
        ivMethodInstrument: 'iv1',
        regDiscontVarName: 'iv1',
      },
      results: {
        methods: {
          regression: [8, 14],
          stratification:  [8, 14],
          matching:  [8, 14],
          weighting:  [8, 14],
          ivs:  [8, 14],
          regDiscont:  [8, 14],
          nde: [8, 12],
          nie: [1, 4],
        },
        waitMs: 20000,
      },
    });
  }, 60000);

});

