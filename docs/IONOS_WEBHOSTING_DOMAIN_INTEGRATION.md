

## Kosten der Dual-Stack-Anbindung

Nach der aktuellen IONOS-Cloud-Preisliste ist die **erste DHCP-IPv4-Adresse kostenlos**. Sie kann sich jedoch ändern, wenn die VM per Power Stop deallokiert oder die Netzwerkschnittstelle entfernt wird. Eine reservierte statische öffentliche IPv4-Adresse wird separat berechnet; die veröffentlichte Preisliste nennt dafür 6,00 USD je 30 Tage. Öffentliche IPv6-Adressen sind kostenlos. Der genaue Betrag in EUR und die Abrechnung des konkreten Kontos müssen vor einer Reservierung im IONOS-Bestellschritt geprüft werden.

Für BlackWaterLeaf Studio bedeutet das: Dual Stack ist technisch möglich. Kostenneutral starten können wir mit dynamischer DHCP-IPv4 plus IPv6. Für eine stabile Produktions-DNS-Adresse ist eine reservierte IPv4 empfehlenswert, aber nicht automatisch durch den Webhosting-Plus-Vertrag abgedeckt.

Quellen: [IONOS Cloud Preise](https://cloud.ionos.com/prices), [IONOS IPv4-Dokumentation](https://docs.ionos.com/cloud/network-services/vdc-networking/ip-address/ipv4/overview), [IONOS IPv6-Dokumentation](https://docs.ionos.com/cloud/network-services/vdc-networking/ip-address/ipv6)
