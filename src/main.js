(() => {
    makeAjax = (url) => {
        return fetch(url).then(res => res.json());
    }

    const filtersUrl = 'http://demo1853299.mockable.io/filters';
    const productsUrl = 'http://demo1853299.mockable.io/products';

    let filtersData = [];
    let productsData = [];

    let filteredProductsArray = [];

    let colorsSelected = [];

    let lastSort = null;

    let brandFilters;

    makeAjax(filtersUrl)
        .then(res => filtersData = res.filters)
        .then(() => {
            console.log(filtersData);
            createFilters();
        })
        .then(() => {
            addEventListenerToSearch();
        })
        .catch(err => console.log(err));

    makeAjax(productsUrl)
        .then(res => productsData = res.products)
        .then(() => {
            console.log(productsData);
            filteredProductsArray = [...productsData];
            renderProducts(filteredProductsArray);
        })
        .catch(err => console.log(err));

    // products

    renderProducts = (arr) => {
        const mainContainer = document.querySelector('.products-wrapper');
        mainContainer.innerHTML = null;
        arr.forEach((product) => {
            mainContainer.appendChild(createProduct(product, mainContainer));
        });
    }

    createProduct = (item, mainContainer) => {
        const container = document.createElement('div');
        container.setAttribute('class', 'item-wrapper');

        const image = document.createElement('img');
        image.setAttribute('src', item.image);

        const imageContainer = document.createElement('div');
        imageContainer.setAttribute('class', 'image-wrapper');
        imageContainer.appendChild(image);

        container.appendChild(imageContainer);

        const heading = document.createElement('a');
        heading.setAttribute('class', 'heading');
        heading.setAttribute('href', '#');
        heading.innerHTML = item.title;

        container.appendChild(heading);

        const rating = document.createElement('span');
        rating.setAttribute('class', 'rating');
        rating.innerHTML = `${item.rating} <i class="far fa-star"></i>`;

        container.appendChild(rating);

        const priceTag = document.createElement('span');
        priceTag.setAttribute('class', 'price-tag');
        priceTag.innerHTML = `&#x20b9; ${item.price.final_price}`;

        container.appendChild(priceTag);


        if (item.discount > 0) {
            const discount = document.createElement('span');
            discount.setAttribute('class', 'discount');
            discount.innerHTML = `-${item.discount}%`;
            container.appendChild(discount);
        }
        return container;
    }
    // Filters
    createFilters = () => {
        const filtersWrapper = document.querySelector('.filters-wrapper');

        filtersData.forEach(filterCategory => {
            const filterContainer = document.createElement('div');
            filterContainer.setAttribute('class', 'filter-category-wrapper');

            const title = document.createElement('p');
            title.innerHTML = filterCategory.type;
            filterContainer.appendChild(title);

            filterContainer.appendChild(insertFiltersToCategory(filterCategory));
            filtersWrapper.appendChild(filterContainer);
        })
    }

    createPriceFilter = (leftvalues, rightvalues) => {
        const container = document.createElement('div');
        container.setAttribute('class', 'price-filter-wrapper');
        const leftSelect = document.createElement('select');
        leftSelect.setAttribute('id', 'left-select');


        const middleText = document.createElement('p');
        middleText.innerHTML = 'to';

        const rightSelect = document.createElement('select');
        rightSelect.setAttribute('id', 'right-select');

        leftvalues.forEach(val => {
            const option = document.createElement('option');
            option.value = val.key;
            option.innerHTML = val.displayValue;

            leftSelect.appendChild(option);
        });

        rightvalues.forEach(val => {
            const option = document.createElement('option');
            option.value = val.key;
            option.innerHTML = val.displayValue;

            rightSelect.appendChild(option);
        });

        container.appendChild(leftSelect);
        container.appendChild(middleText);
        container.appendChild(rightSelect);

        return container;
    }

    insertFiltersToCategory = (filters) => {
        if (filters.type === 'PRICE') {
            const priceFilter = createPriceFilter(filters.values, filters.values);
            return priceFilter;
        } else if (filters.type === 'BRAND') {
            brandFilters = filters.values;
            const searchBar = document.createElement('input');
            searchBar.setAttribute('type', 'text');
            searchBar.setAttribute('placeholder', 'Search for a brand');
            searchBar.setAttribute('id', 'search-bar');

            return searchBar;
        } else {
            const colorsContainer = document.createElement('div');
            colorsContainer.addEventListener('click', colorSelected, true);
            filters.values.forEach(value => {

                const wrapper = document.createElement('div');
                wrapper.setAttribute('class', 'wrapper');

                const title = document.createElement('label');
                title.setAttribute('for', value.title);
                title.innerHTML = value.title;

                const checkbox = document.createElement('input');
                checkbox.setAttribute('type', 'checkbox');
                checkbox.setAttribute('id', value.title);
                checkbox.setAttribute('value', value.title);


                const colorDisplay = document.createElement('span');
                colorDisplay.style = `background-color: ${value.color}`;


                wrapper.appendChild(checkbox);
                wrapper.appendChild(colorDisplay);
                wrapper.appendChild(title);

                colorsContainer.appendChild(wrapper);
            });
            return colorsContainer;
        }
    }

    colorSelected = (event) => {
        event.stopPropagation();
        const targetElement = event.target;
        const bindedElement = event.currentTarget;
        if (targetElement !== bindedElement && (targetElement.nodeName === 'LABEL' || targetElement.nodeName === 'INPUT')) {
            getSelectedColors(bindedElement);
        }
    }


    getSelectedColors = (parentElement) => {
        const checkboxes = parentElement.querySelectorAll('input[type="checkbox"]');
        checkedColor = [];
        checkboxes.forEach((checkbox) => {
            if (checkbox.checked) {
                checkedColor.push(checkbox.value);
            }
        });
        colorsSelected = [...checkedColor];
        console.log(colorsSelected);
        filterAndRenderProducts();
    }

    filterAndRenderProducts = () => {
        if (colorsSelected.length > 0) {
            filteredProductsArray = productsData.filter(product => colorsSelected.indexOf(product.colour.title) < 0 ? false : true);
        } else {
            filteredProductsArray = [...productsData];
        }
        const numberOfProducts = filteredProductsArray.length;
        document.querySelector('.result-header').innerHTML = `Showing ${numberOfProducts} results for 'shoes'`
        renderProducts(filteredProductsArray);
    }

    sortProducts = (option) => {
        lastSort = option;
        switch (option) {
            case 'Relevance':
                filterAndRenderProducts();
                break;
            case 'Price - Low to High':
                filteredProductsArray.sort(lowToHigh);
                renderProducts(filteredProductsArray);
                break;
            case 'Price - High to Low':
                filteredProductsArray.sort(highToLow);
                renderProducts(filteredProductsArray);
                break;
        }
    }

    lowToHigh = (a, b) => {
            return a.price.final_price - b.price.final_price 
    }

    highToLow = (a, b) => {
            return b.price.final_price - a.price.final_price 
    }

    addEventListenerToSearch = () => {
        const brandSearch = document.querySelector('#search-bar');

        brandSearch.addEventListener('keypress', () => {
            searchResults(brandSearch.value);
        })
    }

    searchResults = (text) => {
        let filteredBrandArray;
        filteredBrandArray = filteredProductsArray.filter((product) => {
            if (product.brand.indexOf(text) > -1) {
                return true;
            } else {
                return false;
            }
        });
        filteredProductsArray = [...filteredBrandArray];
        console.log(filteredProductsArray);
        renderProducts(filteredProductsArray);
    }

    addListenersToSortOptions = () => {
        const buttons = document.querySelectorAll('.sort');
        buttons.forEach(btn => {
            btn.addEventListener('click', (event) => {
                buttons.forEach(button => button.classList.remove('selected'));
                btn.classList.add('selected');
                sortProducts(btn.innerHTML);
            })
        })

    }

    addEventToButton = () => {
        const filterButton = document.querySelector('.filter-button');

        if (filterButton) {
            filterButton.addEventListener('click', () => {
                const filters = document.querySelector('.filters');
                const overlay = document.querySelector('.overlay');
                filters.classList.add('open');
                overlay.classList.add('open');
            })
        }
    }

    addEventToOverlay = () => {
        const overlay = document.querySelector('.overlay');

        if (overlay) {
            overlay.addEventListener('click', () => {
                const filters = document.querySelector('.filters');
                const overlay = document.querySelector('.overlay');
                filters.classList.remove('open');
                overlay.classList.remove('open');
            })
        }
    }
    addEventToButton();
    addEventToOverlay();
    addListenersToSortOptions();
})();
