# AP-21 Wikimedia Review Notes

## Verified candidates

The following Commons pages were fetched and checked before any database import:

| Taxon | Commons file | Verification result | License / attribution |
|---|---|---|---|
| *Alocasia clypeolata* | [Alocasia clypeolata 0zz.jpg](https://commons.wikimedia.org/wiki/File:Alocasia_clypeolata_0zz.jpg) | The file description names *Alocasia clypeolata*; structured data depicts the same taxon. | CC BY-SA 4.0; photo by David J. Stang. |
| *Alocasia lauterbachiana* | [Lauterbachiana.jpg](https://commons.wikimedia.org/wiki/File:Lauterbachiana.jpg) | The file page source points to an *Alocasia lauterbachiana* collection page; structured data depicts *Alocasia lauterbachiana*. | CC BY-SA 4.0; source/author credited to Lifestyle Botanics collection page. |
| *Philodendron spiritus-sancti* | [Philodendron spiritus-sancti in Brazil.jpg](https://commons.wikimedia.org/wiki/File:Philodendron_spiritus-sancti_in_Brazil.jpg) | Caption, description, structured data and linked iNaturalist observation identify the same species. | CC BY 4.0; Alexandre Magno, from iNaturalist photo 392910039. |
| *Bucephalandra motleyana* (candidate only for generic *Bucephalandra sp.*) | [Bucephalandra motleyana kz01.jpg](https://commons.wikimedia.org/wiki/File:Bucephalandra_motleyana_kz01.jpg) | Exact species is *B. motleyana*, so it must not be used automatically for the unresolved generic record *Bucephalandra sp.* without a catalog policy decision. | CC BY-SA 4.0; Krzysztof Ziarnek, Kenraiz. |
| *Philodendron plowmanii* (candidate only) | [Sherman Gardens file](https://commons.wikimedia.org/wiki/File:190615_275_Corona_del_Mar,_Sherman_Gardens_-_Tropical_Conservatory,_Anthurium_hookeri,_Anthurium_crassinervium,_Anthurium_%27Giant_Chocolate%27,_Aechmea_fasciata_%27Variegata%27,_Zamia_neurophyllidia,_Philodendron_gloriosum,_Anthurium_plowmanii.jpg) | The filename mentions *Philodendron plowmanii*, but the page description identifies the groundcover as *Selaginella kraussiana* and the image is a mixed conservatory scene. It is not safe as a catalog hero image. | CC BY 2.0; cultivar413 via Flickr. Do not import as exact taxon image. |

## Rejected or held candidates

The resolver also produced generic aquascaping images, images of other species, PDF page thumbnails, nursery catalog pages, and unrelated historical plates. These are not imported as exact catalog images. The Wikidata check found no direct P18 media for most remaining taxa. The *Alocasia nebula* plate is tagged with the taxon in BHL metadata but its page description names *Alocasia guttata var. imperialis*; it remains held pending synonym-level approval.

## Provenance rule

Only a candidate with a direct taxon description or structured `depicts` statement, a stable Commons source page, an image URL, and a usable license/attribution is eligible for the exact provenance SQL. No user content or existing catalog row is deleted by this review.
