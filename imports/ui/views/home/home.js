import '../../stylesheets/home.scss';

import { Template }    from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';

import moment from 'moment';

import './home.html';

//function to return control variables and status indicators in the template instance
//to the initial state
function resetTemplate (instance) {

    instance.name.set('');
    instance.comics.set([]);
    instance.page.set(1);
    instance.pagesList.set(["1"]);
    instance.dataLoaded.set('NO');

    instance.pagesStart   = 0;
    instance.pagesEnd     = 0;
    instance.previousPage = 0;
    instance.loopGroup    = 0;
    instance.comicsOffset = 0;
    instance.canLoadMore  = 'NO';
}


//function to load comics from the server in the template instance, and update all
//the variables and status needed
function loadAllComics (instance) {

    let comics       = instance.comics.get(),
        limitPerLoad = instance.limitPerLoad,
        comicsOffset = instance.comicsOffset;

    Meteor.call('comics.getAll', limitPerLoad + 1, comicsOffset, function (err, res) {

        if (err) {
            console.log('error: ', err);
        }
        else if (res) {

            instance.comics.set(comics.concat(res.slice(0, limitPerLoad)));
            instance.comicsOffset += res.length - 1;

            if (res.length > limitPerLoad) {
                instance.canLoadMore = 'YES';
            }
            else {
                instance.canLoadMore = 'NO';
            }
        }

        instance.dataLoaded.set('YES');
    });
}

//function to load comics from the server in the template instance (based in a
//full/partial character name), and update all the variables and status needed
function loadComicsWithName (instance) {

    let name         = instance.name.get(),
        comics       = instance.comics.get(),
        limitPerLoad = instance.limitPerLoad,
        loopGroup    = instance.loopGroup,
        comicsOffset = instance.comicsOffset,
        responseComicsOffset;

    Meteor.call('comics.getByCharacterName', name, limitPerLoad + 1, loopGroup, comicsOffset, function (err, res) {

        if (err) {
            console.log('error: ', err);
        }
        else if (res) {

            instance.comics.set(comics.concat(res.comics.slice(0, limitPerLoad)));

            responseComicsOffset  = (((res.comicsOffset - 1) % limitPerLoad) == 0) ?
                                    (res.comicsOffset - 1) :
                                    res.comicsOffset;

            if (instance.loopGroup == res.loopGroup) {
                instance.comicsOffset += responseComicsOffset;
            }
            else {
                instance.comicsOffset = responseComicsOffset; 
                instance.loopGroup    = res.loopGroup;
            }
            
            if (res.comics.length > limitPerLoad) {
                instance.canLoadMore = 'YES';
            }
            else {
                instance.canLoadMore = 'NO';
            }
        }

        instance.dataLoaded.set('YES');
        instance.$('.search-name').html('<span class="fas fa-search"></span>');
    });
}

Template.Home.helpers({
    comics: () => {

        let instance     = Template.instance(),
            comics       = instance.comics.get(),
            page         = instance.page.get(),
            limitPerPage = instance.limitPerPage.get();

        console.log('comics: ', comics.map(item => item.title));
        comics = comics.slice(((page - 1) * limitPerPage), (page * limitPerPage));

        return comics;
    },
    canLoadMore: (pageListElement) => {

        let instance       = Template.instance(),
            loadButtonText = instance.loadButtonText,
            canLoadMore    = instance.canLoadMore;

        return ((pageListElement == loadButtonText) && (canLoadMore == 'YES'));
    },
    parseImageURL: function () {

        let context   = this,
            imageObj  = (context.images && (context.images.length > 0)) ?
                        context.images[0] : (
                            context.thumbnail ?
                            context.thumbnail :
                            false
                        ),
            format    = 'portrait_incredible';
        
        if (!imageObj) return '/';

        return (imageObj.path + '/' + format + '.' + imageObj.extension); 
    },
    pagesSlice: () => {

        let instance   = Template.instance(),
            page       = instance.page.get(),
            pagesList  = instance.pagesList.get(),
            pagesStart = instance.pagesStart,
            pagesEnd   = instance.pagesEnd;
        
        pagesList = pagesList.slice(pagesStart, (pagesEnd + 1));

        return pagesList;
    },
    dataLoaded: () => {

        let instance   = Template.instance(),
            dataLoaded = instance.dataLoaded.get();

        return (dataLoaded == 'YES');
    },
    currentComicInfo: () => {

        let instance         = Template.instance(),
            currentComicInfo = instance.currentComicInfo.get();
        
        return currentComicInfo;
    },
    parseCreators: (items) => {

        let creators = items.map(item => (item.name + ' (' + item.role + ')')).join(', ');
        return (creators != '') ? creators : '--';
    },
    parseDate: (dates, typeOfDate) => {

        let dateString      = '',
            formattedDate   = '',
            date;
        
        dates.every((item) => {

            if (item.type == typeOfDate) {
                dateString = item.date;
                return false;
            }

            return true;
        });

        date          = new Date(dateString);
        formattedDate = moment(date).format('LL');

        return formattedDate;
    },
    parseLink: (urls, typeOfLink) => {

        let link = '';

        urls.every((item) => {

            if (item.type == typeOfLink) {
                link = item.url;
                return false;
            }

            return true;
        });

        return (link != '') ? link : '--';
    },
    year: () => moment().format('YYYY')
});

Template.Home.events({
    'click .load-more.ready': (e, t) => {
        
        e.preventDefault();

        t.$('.load-more.ready').removeClass('ready');
        t.$('.load-more').addClass('loading');
        t.$('.load-more').html('<span class="fas fa-hourglass-half blink"></span>');

        let name = t.name.get();

        if (name && (name != '')) {
            loadComicsWithName(t);
        }
        else {
            loadAllComics(t);
        };
    },
    'click .page-prev-btn .page-link': (e, t) => {

        e.preventDefault();

        let page      = t.page.get(),
            pageIndex = page - 1;

        if ((pageIndex - 1) >= 0) {
            t.previousPage = page;
            t.page.set(--page);
        }
    },
    'click .page-next-btn .page-link': (e, t) => {

        e.preventDefault();

        let page      = t.page.get(),
            pagesList = t.pagesList.get(),
            pageIndex = page - 1;

        if (((pageIndex + 1) < pagesList.length) &&
           (pagesList[pageIndex + 1] != t.loadButtonText)) {

            t.previousPage = page;
            t.page.set(++page);
        }
    },
    'click .page-item .page-number': (e, t) => {

        e.preventDefault();

        let page    = t.page.get(),
            element = $(e.currentTarget),
            newPage = Number(element.attr('data-index'));
        
        t.previousPage = page;
        t.page.set(newPage);
    },
    'click .search-name.ready, keypress input.search-field': function (e, t) { 

        if ((e.type == 'keypress') &&
           ((e.which != 13) ||
           !t.$('.search-name').hasClass('ready'))) {
            
            return;
        }
        e.preventDefault();

        let name = t.$('input.search-field').val();
        name     = name.replace(/(^\s+)|(\s+$)/g, '');

        if (name != '') {

            t.$('.search-name').removeClass('ready');
            t.$('.search-name').addClass('disabled');
            t.$('.search-name').html('<span class="fas fa-hourglass-half blink"></span>');
            t.$('input.search-field').val(name);
            t.$('input.search-field').addClass('disabled');
            t.$('input.search-field').attr('readonly', 'readonly');

            resetTemplate(t);
            t.name.set(name);
            loadComicsWithName(t);
        }
        else {
            t.$('input.search-field').val('');
        }
    },
    'blur input.search-field': (e, t) => {

        e.preventDefault();

        let name = t.name.get();
        name     = name.replace(/(^\s+)|(\s+$)/g, '');

        if (name != '') $(e.currentTarget).val(name);
    },
    'click .clear-search': (e, t) => {

        e.preventDefault();

        let name = t.name.get();
        name     = name.replace(/(^\s+)|(\s+$)/g, '');

        if (name != '') {

            resetTemplate(t);
            loadAllComics(t);

            t.$('.search-name').removeClass('disabled');
            t.$('.search-name').addClass('ready');
            t.$('input.search-field').removeClass('disabled');
            t.$('input.search-field').removeAttr('readonly');
        }

        t.$('input.search-field').val('');
    },
    'click .comic-cover-wrapper': function (e, t) {

        e.preventDefault();

        let context  = this,
            imageURL = $(e.currentTarget).find('.comic-cover').attr('src');

        t.currentComicInfo.set({...context, fullImageURL: imageURL});
        t.$('.comic-details-modal').modal('show');
    }
});

Template.Home.onCreated(function () {

    let instance = this;

    instance.name             = new ReactiveVar('');
    instance.comics           = new ReactiveVar([]);
    instance.page             = new ReactiveVar(1);
    instance.pagesList        = new ReactiveVar(["1"]);
    instance.limitPerPage     = new ReactiveVar(10);
    instance.dataLoaded       = new ReactiveVar('NO');
    instance.currentComicInfo = new ReactiveVar();
    
    instance.pagesStart     = 0;
    instance.pagesEnd       = 0;
    instance.previousPage   = 0;
    instance.limitPerLoad   = 40;
    instance.loopGroup      = 0;
    instance.comicsOffset   = 0;
    instance.canLoadMore    = 'NO';
    instance.loadButtonText = 'more!';
});

Template.Home.onRendered(function () {

    let instance = this;

    instance.autorun(() => {

        let comics         = instance.comics,
            page           = instance.page,
            previousPage   = instance.previousPage,
            pagesStart     = instance.pagesStart,
            pagesEnd       = instance.pagesEnd,
            canLoadMore    = instance.canLoadMore,
            loadButtonText = instance.loadButtonText,
            limitPerPage   = instance.limitPerPage.get(),
            pagesList      = [],
            pageIndex;
        
        //updates the pages navigation list when the comics list is modified
        if (comics.get()) {

            comics = comics.get();

            //generates an array with the numbers representing the pages, based on
            //the number of comics loaded in the client
            for (let i = 0, len = Math.ceil(comics.length / limitPerPage); i < len; i++) {
                pagesList.push(String(i + 1));
            }

            //base scenario
            if (pagesList.length == 0) {
                pagesList = ["1"];
            }

            //flags the end of the pages list if there's more comics to load
            if (canLoadMore == 'YES') {
                pagesList.push(loadButtonText);
            }

            instance.pagesList.set(pagesList);

            //sets the start and end of the navigation span in the first load
            if (pagesStart == 0) {
                if (pagesList.length >= 3) {
                    instance.pagesEnd = 2;
                }
                else {
                    instance.pagesEnd = (pagesStart + pagesList.length) - 1;
                }
            }
        }

        //when the current page changes, sets all the status for current page,
        //activates/deactivates the navegation buttons, and shifts the pages
        //list navigation span if necessary
        if (page.get()) {

            page      = page.get();
            pageIndex = page - 1;

            //activates the new page and deactivates the previous one
            instance.$('.page-item.active').removeClass('active');
            instance.$('.page-item[data-index="' + page + '"]').addClass('active');

            //checks if there are pages to navigate further left, and
            //activates/deactivates the left navigation button accordingly
            if ((pageIndex - 1) < 0) {
                instance.$('.page-prev-btn').addClass('disabled');
            }
            else {
                instance.$('.page-prev-btn').removeClass('disabled');
            }

            //checks if there are pages to navigate further right, and
            //activates/deactivates the right navigation button accordingly
            if ((pageIndex + 1) >= pagesList.length ||
               (pagesList[pageIndex + 1] == loadButtonText)) {

                instance.$('.page-next-btn').addClass('disabled');
            }
            else {
                instance.$('.page-next-btn').removeClass('disabled');
            }

            //checks if the new page is within range for any pages navigation span
            //shift that might be necessary
            if (((pageIndex - 1) >= 0) && ((pageIndex + 1) < pagesList.length)) {

                console.log('there\'s space to shift');
                
                //shifts the pages list navigation span to the right if neccessary
                if ((page > previousPage) && ((pageIndex + 1) > pagesEnd)) {
                    instance.pagesStart = (pagesStart + 1);
                    instance.pagesEnd = (pagesEnd + 1);
                }

                //shifts the pages list navigation span to the left if neccessary
                if ((page < previousPage) && ((pageIndex - 1) < pagesStart)) {
                    instance.pagesStart = (pagesStart - 1);
                    instance.pagesEnd = (pagesEnd - 1);
                }
            }
        }
    });

    loadAllComics(instance);
});