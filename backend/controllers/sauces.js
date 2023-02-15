const Sauce = require("../models/Sauce");
const fs = require("fs");

exports.createSauce = (req, res) => {
    const sauceObject = JSON.parse(req.body.sauce);
    delete sauceObject._id;
    delete sauceObject._userId;
    const sauce = new Sauce({
        ...sauceObject,
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
        likes: "0",
        dislikes: "0",
        usersLiked: [],
        usersDisliked: []
    });

    sauce.save()
        .then(() => { res.status(201).json({message: 'Votre sauce a été enregistrée !'})})
        .catch(error => { res.status(400).json( { error })})
};

exports.likeSauce = (req, res, next) => {
    const userId = req.body.userId;
    const like = req.body.like;
    const sauceId = req.params.id;
    Sauce.findOne({ _id: sauceId })
        .then(sauce => {
            const NewObj = {
                usersLiked: sauce.usersLiked,
                usersDisliked: sauce.usersDisliked,
                likes: 0,
                dislikes: 0
            }
            switch (like) {
                case 1:
                    NewObj.usersLiked.push(userId);
                    break;
                case -1:
                    NewObj.usersDisliked.push(userId);
                    break;
                case 0:
                    if (NewObj.usersLiked.includes(userId)) {
                        const index = NewObj.usersLiked.indexOf(userId);
                        NewObj.usersLiked.splice(index, 1);
                    } else {
                        const index = NewObj.usersDisliked.indexOf(userId);
                        NewObj.usersDisliked.splice(index, 1);
                    }
                    break;
            }
            NewObj.likes = NewObj.usersLiked.length;
            NewObj.dislikes = NewObj.usersDisliked.length;
            Sauce.updateOne({ _id: sauceId }, NewObj )
                .then(() => res.status(200).json({ message: ' Avis enregistré' }))
                .catch(error => res.status(400).json({ error }))
        })
        .catch(error => res.status(500).json({ error }));
}

exports.modifySauce = (req, res) => {
    let sauceObject;
    req.file ? (
        Sauce.findOne({_id: req.params.id})
            .then((sauce) => {
            const filename = sauce.imageUrl.split('/images/')[1]
            fs.unlinkSync(`images/${filename}`)
        }),
            sauceObject = {
                ...JSON.parse(req.body.sauce),
                imageUrl: `${req.protocol}://${req.get('host')}/images/${
                    req.file.filename
                }`,
            }
    ) : (sauceObject = {...req.body})
    Sauce.updateOne({_id: req.params.id},
        {
            ...sauceObject,
            _id: req.params.id
        }
    )
        .then(() => res.status(200).json({
            message: 'Sauce modifiée'
        }))
        .catch((error) => res.status(400).json({
            error
        }))
}

exports.deleteSauce = (req, res) => {
    Sauce.findOne({
        _id: req.params.id
    })
        .then(sauce => {
            const filename = sauce.imageUrl.split('/images/')[1];
            fs.unlink(`images/${filename}`, () => {
                Sauce.deleteOne({_id: req.params.id})
                    .then(() => res.status(200).json({message: 'Sauce supprimée'}))
                    .catch(error => res.status(400).json({error}));
            });
        })
        .catch(error => res.status(500).json({error}));
};

exports.getOneSauce = (req, res) => {
    Sauce.findOne({ _id: req.params.id })
        .then(sauce => res.status(200).json(sauce))
        .catch(error => res.status(404).json({ error }))
};

exports.getAllSauces = (req, res) => {
    Sauce.find()
        .then(sauces => res.status(200).json(sauces))
        .catch(error => res.status(400).json({ error }))
};