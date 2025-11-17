
    // Accordion Toggle
    const items = document.querySelectorAll(".accordion-item");

    items.forEach(item => {
      const header = item.querySelector(".accordion-header");
      header.addEventListener("click", () => {
        const openItem = document.querySelector(".accordion-item.active");
        
        if (openItem && openItem !== item) {
          openItem.classList.remove("active");
          openItem.querySelector("span").textContent = "+";
        }

        item.classList.toggle("active");
        const sign = item.classList.contains("active") ? "-" : "+";
        item.querySelector("span").textContent = sign;
      });
    });

     const counters = document.querySelectorAll('.stat-number');
    const speed = 150; // smaller = faster

    counters.forEach(counter => {
      const updateCount = () => {
        const target = +counter.getAttribute('data-target');
        const count = +counter.innerText;

        const increment = Math.ceil(target / speed);

        if (count < target) {
          counter.innerText = count + increment;
          setTimeout(updateCount, 30);
        } else {
          counter.innerText = target + "+"; // add "+" at the end
        }
      };

      updateCount();
    });