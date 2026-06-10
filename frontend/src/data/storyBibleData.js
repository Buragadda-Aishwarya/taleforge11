export const storyBibleData = {
  feed: [
    {
      id: "1",
      type: "link",
      title: "Knowledge Link Established",
      description: 'Connected "Aria\'s Fear" to "The Great Flood" in Ch. 12.',
      timestamp: "2m ago",
      status: "secondary" // maps to cyan
    },
    {
      id: "2",
      type: "alert",
      title: "Inconsistency Detected",
      description: "Kiran's mentor status contradicts Timeline event #402.",
      timestamp: "15m ago",
      status: "primary" // maps to purple/error
    }
  ],
  domains: [
    { id: "characters", label: "Characters", icon: "Users" },
    { id: "locations", label: "Locations", icon: "Compass" },
    { id: "objects", label: "Objects", icon: "Shapes" },
    { id: "world_rules", label: "World Rules", icon: "Scale" },
    { id: "timeline", label: "Timeline", icon: "Calendar" },
  ],
  characterPreview: {
    name: "Aria",
    title: "THE LAST SPECTRE",
    traits: [
      { id: "1", label: "Cannot Swim", type: "negative", icon: "Ban" },
      { id: "2", label: "Hates Magic", type: "neutral", icon: "Zap" }
    ],
    goal: "Find the Moon Sword in the Abyssal Reach.",
    images: {
      avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuBtseUwS-VJJGkahjWhra2Gr0NlpFw1jXLW22C7dKulBNhoRbI--9Xsb-glTmqKzXA0-TpmJd5-N-7Zt_CaXIoBlDsIk2yTzZoxPsm2LyJ6yAMagFz_L7Q9C6HNgp6WsixmM6Nz6H9W9t05FfK9fTBLHxf9OJyGCILpIvSC1SFhx207HUq68xC8tnYY4BFdCgZ6l-2QCqHvSwk0rxbOQ0lYxtpPoI42behInyligVtNE3pSQPNhFMSp8U40rj4IbDTzNW4st6yZkIp2",
      banner: "https://lh3.googleusercontent.com/aida-public/AB6AXuCnzlRGljPwQ92bTBGaVu9jpj5RKW9fFk6LHMSoVltRR6MiXlYQD2-hO4gSoSwoJOlU0nzkhJFmdelKIRINobNpaNlOhoxGDDQHQFo-HzS2qTCXCK2TI__naYoU78TLa5GbAU_WPGSAa_Cn5eb2RKx0X7jn-Y85qx8rAhCHlrEEIdQpuQep2LS97kU3amScKvJvOx2l7tB9-MGLXvDLvW0L4eQeiDTZMCzYdzjLC1ekg42v0wIIGvHw2V9RXglG_UDAOlqArOmMfX6e"
    },
    collaborators: [
     { id: "c1", avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuC9R7VeYZ-hgZYJifUj15cVzTQnh9EeIpnFDWmrO0h4PlKw955OWmasmxKa2nCKpI138voUr-3bUqg2DjyICOJT5SLO1fOt4vOpSstuTHELDkPXqUyOFWygHiJAUVaoRXADleZNOXzqLUTl9UE5qRppZ83H9c-jLWPHk9e7N55Jz8Iuh_zwPLjEzGtHjMw5pC4-psnbKCt_U_89l-n_DJjeyxcTIv-m3L3qTbuZ0E9rGvIBUAWikBdY2TM2THQT91xhhOZyRLU0JvLS" }
    ],
    collaboratorCount: 3
  },
  graphData: {
    focus: "Kiran & Aria Alliance",
    node1: {
      name: "Kiran",
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuA85cSUnlgiuCmEDrOhr7PULKDdGx4VnpdQV1XZf867dISc8cB6SV2A_yVptpszMRuTqpvLHLlbeaHDeRbpXAyKhT6JEdOS3LbhDunb6al6Tc3m52O9eDytjcQKOpp92tRy7hsZxe7B-5hWKH1VT0bpl-xtrO-1FVJ91kTplKbj-al_s2QzeaZQmHjjztonJSPaUKkZlN8qoU2jUU2rByMKavqWQGEwUzp2UXgTnwfN8eO0sPpltWJhTLr81rC1M_2O4CYZM0dQqFHc"
    },
    node2: {
      name: "Aria",
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDbI1EfxJEKOm8bSZSwDoKMvlELYRVwxfEGGnM8R-ZxchSB7Hf0mPjSEStzLOg5ngB69srr3FAG9reDNMSnjx7U_-nya1FxS922jYtTjjDKj84grRZoeIyjX0mEHlFHqHtUH9oA1CGWVYe3o80E_zeyWSBoMq2nWeUyzoD56dMvZv6ApyzfjeqkbZ7mpVGzcVQkrbZDuGMKjNFVi0U82MrcuiNUasJ-VgtCM6iPWylZV_GS1nrbevmWfQ6P25Vp9KW91lHOcUSjQcun"
    },
    relationship: "MENTOR"
  }
};
