const Sauce = require('../models/sauce');
const fs = require('fs');


exports.createSauce = (req, res, next) => {
    const sauceObject = JSON.parse(req.body.sauce);
    delete sauceObject._id;
    delete sauceObject._userId;
    const sauce = new Sauce({
        userId: req.body.userId,
        ... sauceObject,
        userID: req.auth.userId,
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
        likes: 0,
        dislikes: 0,
        usersLiked: [],
        usersDisliked: [],
    });
    sauce.save().then(
        () => {
            res.status(201).json({
                message: 'Sauce ajoutée!'
            });
        }
    ).catch(
        (error) => {
            res.status(400).json({
                error: error
            });
        }
    ); 
};

exports.getOneSauce = (req, res, next) => {
    Sauce.findOne({_id: req.params.id})
        .then((sauce) => {
            res.status(200).json(sauce);
        }
    ).catch(
        (error) => {
            res.status(404).json({
                error: error
            });
        }
    );
};

exports.modifySauce = (req, res, next) => {
        const sauceObject = req.file ? {
            ... JSON.parse(req.body.sauce),
            imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
        } : { ... req.body };
      
        delete sauceObject._userId;
        Sauce.findOne({_id: req.params.id})
            .then((sauce) => {
                if (sauce.userId != req.auth.userId) {
                    res.status(401).json({ message : 'Pas autorisé'});
                } else {
                    Sauce.updateOne({ _id: req.params.id}, { ...sauceObject, _id: req.params.id})
                    .then(() => res.status(200).json({message : 'Sauce modifiée!'}))
                    .catch(error => res.status(401).json({ error }));
                }
            })
            .catch((error) => {
                res.status(400).json({ error });
            });
     };

exports.deleteSauce = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id})
       .then(sauce => {
           if (sauce.userId !== req.auth.userId) {
               res.status(401).json({message: 'Pas autorisé'});
           } else {
               const filename = sauce.imageUrl.split('/images/')[1];
               fs.unlink(`images/${filename}`, () => {
                   Sauce.deleteOne({_id: req.params.id})
                       .then(() => { res.status(200).json({message: 'Sauce supprimée !'})})
                       .catch(error => res.status(401).json({ error }));
               });
           }
       })
       .catch( error => {
           res.status(500).json({ error });
       });
};

exports.getAllSauces = (req, res, next) => {
    Sauce.find().then(
        (sauces) => {
            res.status(200).json(sauces);
        }
    ).catch(
        (error) => {
            res.status(400).json({
                error: error
            });
        }
    );
};

exports.sauceLike = (req, res, next) => {
    const userId = req.body.userId;

    if (req.body.like == 1){
    Sauce.updateOne({ _id: req.params.id}, {$push: { usersLiked: userId }, $inc: {likes: +1}})
    .then(() => res.status(201).json({ message : 'Sauce likée!' }))
    .catch(error => res.status(400).json({ error }));
    }

    else if (req.body.like == -1) {
    Sauce.updateOne({ _id: req.params.id}, {$push: { usersDisliked: userId }, $inc: {dislikes: +1}})
    .then(() => res.status(201).json({ message : 'Sauce dislikée!' }))
    .catch(error => res.status(400).json({ error }));
    }

    else {
    Sauce.findOne({ _id: req.params.id})
    .then ((sauce) => {
        if (sauce.usersLiked.includes(userId)) {
        Sauce.updateOne({ _id: req.params.id}, {$pull: {usersLiked: userId }, $inc: {likes: -1}})
        .then(() => res.status(201).json({ message : "La sauce n'est plus likée!" }))
        .catch(error => res.status(400).json({ error }));
        }

        else if (sauce.usersDisliked.includes(userId)) {
        Sauce.updateOne({ _id: req.params.id}, {$pull: {usersDisliked: userId }, $inc: {dislikes: -1}})
        .then(() => res.status(201).json({ message : "La sauce n'est plus dislikée!" }))
        .catch(error => res.status(400).json({ error }));
        }})
    }
};