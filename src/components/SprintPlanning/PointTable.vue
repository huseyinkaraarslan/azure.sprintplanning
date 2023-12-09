<template>
    <v-dialog v-if="isShow"
              v-model="isShow"
              max-width="600px">
        <v-card v-if="isShow"
                color="card">
            <v-card-title>
                <span class="mx-auto">{{ $t('Point_Table') }}</span>
            </v-card-title>
          <v-card-text>
              <v-container class="pa-0">
                  <v-form v-model="valid"
                          ref="form"
                          onsubmit="event.preventDefault(); return false"
                          lazy-validation>
                      <!-- <v-simple-table v-if="config.isAdmin"
                                      dense>
                          <template v-slot:default>
                              <thead>
                                  <tr>
                                      <td/>
                                      <td v-for="(header, columnIndex) in config.scoringMetrics.columnHeaders"
                                          :key="columnIndex">
                                          <b>{{header}}</b>
                                      </td>
                                  </tr>
                              </thead>
                              <tbody>
                                  <tr v-for="(header, rowIndex) in config.scoringMetrics.rowHeaders"
                                      :key="rowIndex">
                                      <td><b>{{ header }}</b></td>
                                      <td v-for="(val, columnIndex) in config.scoringMetrics.columnHeaders.length"
                                          :key="columnIndex">
                                          <v-text-field :value="config.scoringMetrics.tableMatrix[rowIndex][columnIndex]"
                                                        class="my-1"
                                                        style="width: 50px;"
                                                        hide-details
                                                        solo
                                                        dense
                                                        @input="checkPoint(rowIndex, columnIndex, $event)"/>
                                      </td>
                                      <td class="pa-0">
                                          <v-btn icon
                                                 color="primary"
                                                 @click="addRow(rowIndex)">
                                              <v-icon>mdi-plus</v-icon>
                                          </v-btn>
                                      </td>
                                      <td class="pa-0">
                                          <v-btn icon
                                                 color="error"
                                                 @click="removeRow(rowIndex)">
                                              <v-icon>mdi-minus</v-icon>
                                          </v-btn>
                                      </td>
                                  </tr>
                              </tbody>
                          </template>
                      </v-simple-table> -->
                      <v-simple-table dense>
                          <template v-slot:default>
                              <thead>
                                  <tr>
                                      <td/>
                                      <td v-for="(header, columnIndex) in config.scoringMetrics.columnHeaders"
                                          :key="columnIndex">
                                          <b>{{header}}</b>
                                      </td>
                                  </tr>
                              </thead>
                              <tbody>
                                  <tr v-for="(header, rowIndex) in config.scoringMetrics.rowHeaders"
                                      :key="rowIndex">
                                      <td>
                                          <b>{{ header }}</b>
                                      </td>
                                      <td v-for="(val, columnIndex) in config.scoringMetrics.columnHeaders.length"
                                          :key="columnIndex">
                                          {{ config.scoringMetrics.tableMatrix[rowIndex][columnIndex] }}
                                      </td>
                                  </tr>
                              </tbody>
                          </template>
                      </v-simple-table>
                  </v-form>
              </v-container>
          </v-card-text>
          <!-- <v-card-actions v-if="config.isAdmin">
              <v-spacer/>
              <v-btn text
                     @click="updatePointTable">
                  {{ $t('Common.Save') }}
              </v-btn>
          </v-card-actions> -->
        </v-card>
  </v-dialog>
</template>

<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';
import {Watch} from 'vue-property-decorator';
import {getConfig} from '@/services';
import {Config} from '@/model/Planning';

@Component({
    name: 'sp-point-table-dialog'
})
export default class PointTable extends Vue {
    config: Config = getConfig();
    isShow = true;
    valid = false;

    checkPoint(rowIndex, columnIndex, val) {
        if (!/^[1-9]\d*$/.test(val) || val > 100) {
            this.$nextTick(() => {
                if (this.config.scoringMetrics?.tableMatrix) {
                    this.config.scoringMetrics.tableMatrix[rowIndex][columnIndex] = val.substring(0, val.length - 1);
                }
            });
        } else {
            this.$nextTick(() => {
                if (this.config.scoringMetrics?.tableMatrix) {
                    this.config.scoringMetrics.tableMatrix[rowIndex][columnIndex] = parseInt(val);
                }
            });
        }
    }

    addRow(rowIndex) {
        return 0;
    }

    removeRow(rowIndex) {
        return 0;
    }

    addColumn() {
        return 0;
    }

    removeColumn() {
        return 0;
    }

    async updatePointTable() {
        return 0;
    }

    @Watch('isShow')
    dialogHandler(val: boolean) {
        if (!val) {
            this.$emit('close');
        }
    }
}
</script>
