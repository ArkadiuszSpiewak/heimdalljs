const express = require('express')
const router = express.Router()
const { Item } = require('../models/index')
const multer = require('multer')
const upload = multer({ dest: require('../config/config').uploadDir })
const path = require('path')
const fs = require('fs')
const config = require('../config/config')

/* GET users listing. */
router.get('/', async (req, res, next) => {
  if (!req.user) {
    return res.status(403).json({
      status: 'error',
      result: 'unauthorized'
    })
  }

  const items = await Item.findAll({
    where: {
      userId: req.user.id
    }
  })

  return res.json({
    status: 'ok',
    result: items.map(item => item.toJSON())
  })
})

router.post('/', upload.single('icon'), async (req, res, next) => {
  if (!req.user) {
    return res.status(403).json({
      status: 'error',
      result: 'unauthorized'
    })
  }

  if (req.file) {
    const newIcon = `${req.file.filename}${path.extname(req.file.originalname)}`
    fs.renameSync(path.join(req.file.destination, req.file.filename), path.join(config.uploadDir, 'avatars', newIcon))
    req.body.icon = `/icons/${newIcon}`
  }

  const item = await Item.create({
    ...req.body,
    userId: req.user.id
  })

  return res.json({
    status: 'ok',
    result: item.toJSON()
  })
})

router.put('/:id', upload.single('icon'), async (req, res, next) => {
  if (!req.user) {
    return res.status(403).json({
      status: 'error',
      result: 'unauthorized'
    })
  }

  const item = await Item.findOne({
    where: {
      id: req.params.id
    }
  })

  if (!item) {
    return res.status(404).json({
      status: 'error',
      result: null
    })
  }

  if (item.userId !== req.user.id) {
    return res.status(403).json({
      status: 'error',
      result: 'unauthorized'
    })
  }

  if (req.file) {
    const newIcon = `${req.file.filename}${path.extname(req.file.originalname)}`
    fs.renameSync(path.join(req.file.destination, req.file.filename), path.join(config.uploadDir, 'avatars', newIcon))
    req.body.icon = `/icons/${newIcon}`

    if (item.icon) {
      try {
        fs.unlinkSync(path.join(config.uploadDir, item.icon))
      } catch (e) { }
    }
  }

  await item.update(req.body)

  return res.json({
    status: 'ok',
    result: item.toJSON()
  })
})

router.delete('/:id', async (req, res, next) => {
  if (!req.user) {
    return res.status(403).json({
      status: 'error',
      result: 'unauthorized'
    })
  }

  const item = await Item.findOne({
    wheree: {
      id: req.params.id
    }
  })

  if (!item) {
    return res.status(404).json({
      status: 'error',
      result: null
    })
  }

  if (item.userId !== req.user.id) {
    return res.status(403).json({
      status: 'error',
      result: 'unauthorized'
    })
  }

  await item.destroy()

  return res.json({
    status: 'ok',
    result: null
  })
})

module.exports = router
