# BlackWaterLeaf live sensor data flow

## Current implementation

The home dashboard now combines two honest data sources. Outdoor conditions are retrieved live from the Open-Meteo current-weather endpoint after an explicit browser location permission. The browser supplies coordinates only for that single request. BlackWaterLeaf neither writes those coordinates to its database nor returns them to the client in the weather response. The current response includes outdoor temperature, relative humidity, a WMO weather code, a derived condition, and a safe presentation effect.

Private water values are not fabricated. The dashboard reads water temperature and pH from the most recently updated private aquarium record of the signed-in account. Users maintain those values through **Profile → Meine Anlagen & Werte → Aquarium**. If no value exists, the field remains visibly empty and directs the user to the correct private setup area.

| Dashboard field | Current source | Visibility | Refresh behavior |
|---|---|---|---|
| Water temperature | Private aquarium profile | Only the signed-in account | On account-data refresh |
| pH value | Private aquarium profile | Only the signed-in account | On account-data refresh |
| Outdoor humidity | Open-Meteo current weather | Browser session only | Every five minutes while the app is open |
| Outdoor temperature | Open-Meteo current weather | Browser session only | Every five minutes while the app is open |

## Weather atmosphere

The weather presentation is derived from the official WMO condition code returned by the provider. Codes for fog activate a subtle fog layer. Drizzle, rain, showers, and thunderstorms activate the rain layer. Clear, cloudy, and snow conditions do not activate either decorative effect. Motion is disabled for visitors who request reduced motion.

## Smart-device connection boundary

No smart-device integration is claimed or simulated. A real integration must be implemented provider by provider after the device manufacturer, model, cloud API or local connection method is known. It should use a per-user, revocable authorization token and should allow users to select which aquarium receives the incoming readings. No credentials or device API keys are stored in the browser.

## Source

Outdoor weather parameters and WMO code interpretation follow the [Open-Meteo Weather Forecast API documentation](https://open-meteo.com/en/docs), accessed 16 September 2026.
