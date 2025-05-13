<template>
    <v-container>
        <v-row>
            <v-col cols="12" md="4">
                <v-select v-model="selectedLocationId" :items="locations" item-title="name" item-value="id"
                    label="Select Location" dense outlined class="mb-2"></v-select>
            </v-col>
        </v-row>
        <v-row>
            <v-col cols="12">
                <v-card v-if="selectedLocation && selectedWeatherData && weatherAlert">
                    <v-card-title class="text-h6">
                        {{ selectedLocation.name }} Weather Alert
                    </v-card-title>
                    <v-card-text>
                        <v-alert :type="weatherAlert.type" border="left" colored-border elevation="2">
                            <strong>{{ weatherAlert.title }}</strong><br />
                            {{ weatherAlert.description }}<br /><br />
                            <strong>Temperature Range:</strong>
                            {{ selectedWeatherData.min }}°C to {{ selectedWeatherData.max }}°C<br />
                            <strong>Advisory:</strong> {{ weatherAlert.advice }}
                        </v-alert>
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>
    </v-container>
</template>

<script>
export default {
    data() {
        return {
            selectedLocationId: null,
            locations: [
                { id: 'london', name: 'London' },
                { id: 'manchester', name: 'Manchester' },
                { id: 'newcastle', name: 'Newcastle' },
                { id: 'bristol', name: 'Bristol' }
            ],
            weatherData: {
                london: { min: 10, max: 17 },
                manchester: { min: 8, max: 15 },
                newcastle: { min: -2, max: 3 },
                bristol: { min: 12, max: 20 }
            },
            alerts: {
                london: {
                    type: 'warning',
                    title: 'Heavy Rain Warning',
                    description: 'Persistent heavy rain expected throughout the day. Localised flooding likely.',
                    advice: 'Carry waterproof gear and avoid low-lying areas.'
                },
                manchester: {
                    type: 'info',
                    title: 'Mild and Breezy',
                    description: 'Mild temperatures with occasional gusts of wind.',
                    advice: 'Light jacket recommended. Exercise caution on elevated routes.'
                },
                newcastle: {
                    type: 'error',
                    title: 'Snow and Ice Warning',
                    description: 'Snowfall likely in the evening with icy patches overnight.',
                    advice: 'Travel disruption expected. Avoid unnecessary journeys.'
                },
                bristol: {
                    type: 'success',
                    title: 'Clear Skies Ahead',
                    description: 'Bright and sunny all day with no precipitation.',
                    advice: 'Ideal day for outdoor activities. Use sunscreen.'
                }
            }
        };
    },
    computed: {
        selectedLocation() {
            return this.locations.find(loc => loc.id === this.selectedLocationId);
        },
        selectedWeatherData() {
            return this.selectedLocation ? this.weatherData[this.selectedLocation.id] : null;
        },
        weatherAlert() {
            return this.selectedLocation ? this.alerts[this.selectedLocation.id] : null;
        }
    }
};
</script>

<style scoped>
.v-alert {
    font-size: 1.1em;
}
</style>